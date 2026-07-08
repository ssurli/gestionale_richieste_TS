/**
 * Test dei moduli server del BFF (src/lib/server/*):
 * estrazione/decodifica token, schemi Zod, transizioni con enforcement
 * ruoli server-side e compensazione dell'audit.
 */

import { describe, test, expect, vi } from 'vitest';
import { extractBearer, decodeJwtPayload, ApiAuthError } from '@/lib/server/auth';
import { submitRequestSchema, transitionSchema, guidSchema } from '@/lib/server/schemas';
import { executeServerTransition, TransitionError } from '@/lib/server/transitions';
import type { DataverseClient } from '@/lib/dataverseClient';
import { RequestStatus, TrackType, UserRole, User, TechnologyRequest } from '@/types';

const GUID = '33333333-3333-3333-3333-333333333333';

function fakeToken(payload: Record<string, unknown>): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'RS256' })}.${b64(payload)}.firma`;
}

describe('auth server (bearer + payload JWT)', () => {
  test('estrae il bearer dall\'header Authorization', () => {
    const req = new Request('http://x/api', { headers: { Authorization: 'Bearer abc.def.ghi' } });
    expect(extractBearer(req)).toBe('abc.def.ghi');
  });

  test('header mancante → 401', () => {
    const req = new Request('http://x/api');
    expect(() => extractBearer(req)).toThrow(ApiAuthError);
  });

  test('decodifica il payload JWT (upn)', () => {
    const payload = decodeJwtPayload(fakeToken({ upn: 'utente@example.invalid' }));
    expect(payload.upn).toBe('utente@example.invalid');
  });

  test('token non JWT → 401', () => {
    expect(() => decodeJwtPayload('non-un-jwt')).toThrow(ApiAuthError);
  });
});

describe('schemi Zod', () => {
  const payloadValido = {
    tipoAcquisto: 'PROGRAMMATO',
    tipoApparecchiatura: 'GENERALE',
    nomeApparecchiatura: 'ECG',
    descrizioneDettagliata: 'ECG 12 derivazioni',
    motivazioneRichiesta: 'Incremento attività',
    unitaOperativa: 'Cardiologia',
    dipartimento: 'Medico',
    isSostituzione: false,
    budget: {
      valoreStimatoEuro: 12000,
      ivaEsclusa: true,
      fonteFinanziamento: 'PIANO_INVESTIMENTI',
      annoRiferimento: new Date().getFullYear(),
      budgetDisponibile: true,
      richiestaIntegrazione: false,
    },
    richiedeService: false,
    richiedeConsumabili: false,
    isDonazione: false,
    richiedeAdeguamentiStrutturali: false,
  };

  test('payload valido accettato', () => {
    expect(submitRequestSchema.safeParse(payloadValido).success).toBe(true);
  });

  test('importo negativo rifiutato', () => {
    const p = structuredClone(payloadValido);
    p.budget.valoreStimatoEuro = -5;
    expect(submitRequestSchema.safeParse(p).success).toBe(false);
  });

  test('enum non valido rifiutato', () => {
    const p = { ...payloadValido, tipoAcquisto: 'REGALO' };
    expect(submitRequestSchema.safeParse(p).success).toBe(false);
  });

  test('chiavi sconosciute scartate (il server ricostruisce il record)', () => {
    const p = { ...payloadValido, ts_ruolo: 'ADMIN', statoCorrente: 'APPROVATA' };
    const r = submitRequestSchema.safeParse(p);
    expect(r.success).toBe(true);
    expect(r.success && 'ts_ruolo' in r.data).toBe(false);
    expect(r.success && 'statoCorrente' in r.data).toBe(false);
  });

  test('transizione: stato non esistente rifiutato', () => {
    expect(transitionSchema.safeParse({ toStatus: 'INESISTENTE' }).success).toBe(false);
    expect(transitionSchema.safeParse({ toStatus: 'APPROVATA' }).success).toBe(true);
  });

  test('guidSchema rifiuta id non GUID', () => {
    expect(guidSchema.safeParse("x') or 1 eq 1").success).toBe(false);
    expect(guidSchema.safeParse(GUID).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Transizioni server-side
// ---------------------------------------------------------------------------

function utente(ruolo: UserRole): User {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    nome: 'Mario',
    cognome: 'Bianchi',
    email: 'm@example.invalid',
    ruolo,
    attivo: true,
    dataCreazione: new Date(),
  };
}

function richiesta(stato: RequestStatus): TechnologyRequest {
  return {
    id: GUID,
    statoCorrente: stato,
    trackAssegnato: TrackType.FAST_TRACK,
    storico: [],
    allegati: [],
  } as unknown as TechnologyRequest;
}

function mockClient(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    getRequestById: vi.fn().mockResolvedValue(richiesta(RequestStatus.SOTTOMESSA)),
    updateRequest: vi.fn().mockResolvedValue(undefined),
    addWorkflowHistory: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as DataverseClient;
}

describe('executeServerTransition', () => {
  test('ruolo autorizzato: stato aggiornato e audit scritto', async () => {
    const client = mockClient();
    const esito = await executeServerTransition(
      client,
      utente(UserRole.DIRETTORE_DIPARTIMENTO),
      GUID,
      RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO,
      'ok'
    );

    expect(esito.from).toBe(RequestStatus.SOTTOMESSA);
    expect(esito.to).toBe(RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO);
    expect(client.updateRequest).toHaveBeenCalledWith(GUID, {
      statoCorrente: RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO,
    });
    expect(client.addWorkflowHistory).toHaveBeenCalled();
  });

  test('ruolo NON autorizzato → 403, nessuna scrittura', async () => {
    const client = mockClient();
    await expect(
      executeServerTransition(
        client,
        utente(UserRole.RESPONSABILE_UO),
        GUID,
        RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO
      )
    ).rejects.toMatchObject({ status: 403 });
    expect(client.updateRequest).not.toHaveBeenCalled();
  });

  test('richiesta inesistente → 404', async () => {
    const client = mockClient({ getRequestById: vi.fn().mockResolvedValue(null) });
    await expect(
      executeServerTransition(
        client,
        utente(UserRole.DIRETTORE_DIPARTIMENTO),
        GUID,
        RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO
      )
    ).rejects.toMatchObject({ status: 404 });
  });

  test('audit fallito → compensazione (stato riportato) e 502', async () => {
    const client = mockClient({
      addWorkflowHistory: vi.fn().mockRejectedValue(new Error('permesso negato')),
    });

    await expect(
      executeServerTransition(
        client,
        utente(UserRole.DIRETTORE_DIPARTIMENTO),
        GUID,
        RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO
      )
    ).rejects.toBeInstanceOf(TransitionError);

    // prima applica il nuovo stato, poi compensa riportando il precedente
    expect(client.updateRequest).toHaveBeenNthCalledWith(1, GUID, {
      statoCorrente: RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO,
    });
    expect(client.updateRequest).toHaveBeenNthCalledWith(2, GUID, {
      statoCorrente: RequestStatus.SOTTOMESSA,
    });
  });
});
