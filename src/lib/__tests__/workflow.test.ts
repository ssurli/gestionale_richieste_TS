/**
 * Test delle transizioni di workflow e dell'audit trail in memoria
 * (src/lib/workflow.ts)
 */

import { describe, test, expect } from 'vitest';
import {
  canExecuteTransition,
  executeTransition,
  getNextStatuses,
  approveRequest,
  rejectRequest,
  returnRequest,
} from '@/lib/workflow';
import { TechnologyRequest, RequestStatus, TrackType, User, UserRole } from '@/types';

function utente(ruolo: UserRole): User {
  return {
    id: 'u-1',
    nome: 'Mario',
    cognome: 'Bianchi',
    email: 'mario.bianchi@example.invalid',
    ruolo,
    attivo: true,
    dataCreazione: new Date(),
  };
}

function richiesta(
  stato: RequestStatus,
  track: TrackType = TrackType.FAST_TRACK
): TechnologyRequest {
  return {
    id: 'r-1',
    numeroProgressivo: '2026-001',
    dataCreazione: new Date(),
    dataUltimaModifica: new Date(),
    statoCorrente: stato,
    trackAssegnato: track,
    giorniTrascorsi: 0,
    richiedenteId: 'u-0',
    richiedente: utente(UserRole.RESPONSABILE_UO),
    unitaOperativa: 'UO Test',
    dipartimento: 'Dip Test',
    tipoAcquisto: 'PROGRAMMATO' as any,
    tipoApparecchiatura: 'GENERALE' as any,
    nomeApparecchiatura: 'Ecografo',
    descrizioneDettagliata: 'Test',
    caratteristicheTecniche: 'Test',
    motivazioneRichiesta: 'Test',
    impattoAssistenziale: 'Test',
    esistonoAlternative: false,
    isSostituzione: false,
    budget: {
      valoreStimatoEuro: 10000,
      ivaEsclusa: true,
      fonteFinanziamento: 'PIANO_INVESTIMENTI',
      annoRiferimento: new Date().getFullYear(),
      budgetDisponibile: true,
      richiestaIntegrazione: false,
      validatoUSLPM: false,
    },
    richiedeService: false,
    richiedeConsumabili: false,
    isDonazione: false,
    richiedeAdeguamentiStrutturali: false,
    studioFattibilitaRichiesto: false,
    richiedeHTARegionale: false,
    allegati: [],
    storico: [],
  };
}

describe('canExecuteTransition - enforcement ruoli (client-side)', () => {
  test('Direttore Dipartimento può validare una FAST_TRACK sottomessa', () => {
    const r = richiesta(RequestStatus.SOTTOMESSA);
    expect(
      canExecuteTransition(
        utente(UserRole.DIRETTORE_DIPARTIMENTO),
        r,
        RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO
      )
    ).toBe(true);
  });

  test('Responsabile UO NON può validare (ruolo non autorizzato)', () => {
    const r = richiesta(RequestStatus.SOTTOMESSA);
    expect(
      canExecuteTransition(
        utente(UserRole.RESPONSABILE_UO),
        r,
        RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO
      )
    ).toBe(false);
  });

  test('transizione non definita nel track → negata', () => {
    const r = richiesta(RequestStatus.SOTTOMESSA);
    expect(
      canExecuteTransition(utente(UserRole.DIRETTORE_DIPARTIMENTO), r, RequestStatus.APPROVATA)
    ).toBe(false);
  });

  test('richiesta senza track assegnato → nessuna transizione', () => {
    const r = { ...richiesta(RequestStatus.SOTTOMESSA), trackAssegnato: undefined };
    expect(
      canExecuteTransition(
        utente(UserRole.DIRETTORE_DIPARTIMENTO),
        r,
        RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO
      )
    ).toBe(false);
    expect(getNextStatuses(r, utente(UserRole.DIRETTORE_DIPARTIMENTO))).toEqual([]);
  });
});

describe('executeTransition - audit trail in memoria', () => {
  test('transizione autorizzata: aggiorna stato e appende voce di storico completa', () => {
    const r = richiesta(RequestStatus.SOTTOMESSA);
    const u = utente(UserRole.DIRETTORE_DIPARTIMENTO);

    const updated = executeTransition(r, u, RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO, 'ok');

    expect(updated.statoCorrente).toBe(RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO);
    expect(updated.storico).toHaveLength(1);
    const entry = updated.storico[0];
    expect(entry.statoPrec).toBe(RequestStatus.SOTTOMESSA);
    expect(entry.statoNuovo).toBe(RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO);
    expect(entry.utenteId).toBe(u.id);
    expect(entry.note).toBe('ok');
    expect(entry.id).toBeTruthy();
    // l'oggetto originale non viene mutato
    expect(r.statoCorrente).toBe(RequestStatus.SOTTOMESSA);
    expect(r.storico).toHaveLength(0);
  });

  test('transizione NON autorizzata → eccezione', () => {
    const r = richiesta(RequestStatus.SOTTOMESSA);
    expect(() =>
      executeTransition(r, utente(UserRole.RESPONSABILE_UO), RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO)
    ).toThrow();
  });

  test('id delle voci di storico univoci', () => {
    const u = utente(UserRole.DIRETTORE_DIPARTIMENTO);
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const updated = executeTransition(
        richiesta(RequestStatus.SOTTOMESSA),
        u,
        RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO
      );
      ids.add(updated.storico[0].id);
    }
    expect(ids.size).toBe(50);
  });
});

describe('approveRequest / rejectRequest / returnRequest', () => {
  test('approvazione da IN_APPROVAZIONE_DA → APPROVATA', () => {
    const r = richiesta(RequestStatus.IN_APPROVAZIONE_DA);
    const updated = approveRequest(r, utente(UserRole.DIREZIONE_AMMINISTRATIVA));
    expect(updated.statoCorrente).toBe(RequestStatus.APPROVATA);
  });

  test('approvazione da stato non approvabile → eccezione', () => {
    const r = richiesta(RequestStatus.BOZZA);
    expect(() => approveRequest(r, utente(UserRole.DIREZIONE_AMMINISTRATIVA))).toThrow();
  });

  test('respingimento: stato RESPINTA, esito e motivazione tracciati', () => {
    const r = richiesta(RequestStatus.IN_PRESCREENING);
    const updated = rejectRequest(r, utente(UserRole.COORDINATORE_COMMAZ), 'documentazione carente');
    expect(updated.statoCorrente).toBe(RequestStatus.RESPINTA);
    expect(updated.esitoFinale).toBe('RESPINTO');
    expect(updated.motivazioneEsitoFinale).toBe('documentazione carente');
    expect(updated.storico.at(-1)?.statoNuovo).toBe(RequestStatus.RESPINTA);
  });

  test('rinvio per integrazioni: stato RINVIATA con nota', () => {
    const r = richiesta(RequestStatus.IN_PRESCREENING);
    const updated = returnRequest(r, utente(UserRole.COORDINATORE_COMMAZ), 'manca preventivo');
    expect(updated.statoCorrente).toBe(RequestStatus.RINVIATA);
    expect(updated.storico.at(-1)?.note).toBe('manca preventivo');
  });
});
