/**
 * Test del client Dataverse (src/lib/dataverseClient.ts):
 * retry su throttling, audit trail non silenzioso, anti-injection OData.
 * MSAL e fetch sono mockati: nessuna chiamata reale.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/msalInstance', () => {
  const fakePca = {
    getAllAccounts: () => [
      { username: "o'neil@uslnordovest.toscana.it", name: 'Owen Neil', localAccountId: 'aad-1' },
    ],
    acquireTokenSilent: async () => ({ accessToken: 'fake-token' }),
  };
  return {
    ensureMsalInitialized: async () => fakePca,
    getMsalInstance: () => fakePca,
  };
});

import { DataverseClient, DataverseError, odataEscape } from '@/lib/dataverseClient';

const GUID_A = '11111111-1111-1111-1111-111111111111';
const GUID_B = '22222222-2222-2222-2222-222222222222';

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('odataEscape', () => {
  test('raddoppia gli apici (anti-injection nei filtri)', () => {
    expect(odataEscape("o'neil")).toBe("o''neil");
    expect(odataEscape("a' or ts_ruolo eq 'ADMIN")).toBe("a'' or ts_ruolo eq ''ADMIN");
    expect(odataEscape('senza apici')).toBe('senza apici');
  });
});

describe('retry su throttling Dataverse', () => {
  test('429 con Retry-After → retry e poi successo', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response('throttled', { status: 429, headers: { 'Retry-After': '0' } })
      )
      .mockResolvedValueOnce(jsonResponse({ value: [] }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new DataverseClient();
    const result = await client.getRequests();

    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  }, 15000);

  test('errore non-retryable (400) → DataverseError con status e dettaglio, senza retry', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('Bad Request: campo mancante', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new DataverseClient();
    await expect(client.getRequests()).rejects.toMatchObject({
      name: 'DataverseError',
      status: 400,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('addWorkflowHistory - audit trail', () => {
  test('fallimento HTTP → LANCIA DataverseError (niente best-effort)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('permesso negato', { status: 403 }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new DataverseClient();
    await expect(
      client.addWorkflowHistory(GUID_A, GUID_B, 'Transizione', 'SOTTOMESSA', 'IN_TRIAGE')
    ).rejects.toBeInstanceOf(DataverseError);
  });

  test('id non-GUID → rifiutato PRIMA di chiamare la rete', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const client = new DataverseClient();
    await expect(
      client.addWorkflowHistory("x') or 1 eq 1", GUID_B, 'Transizione')
    ).rejects.toBeInstanceOf(DataverseError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('successo → POST su ts_workflow_histories con attore, stati e timestamp', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new DataverseClient();
    await client.addWorkflowHistory(GUID_A, GUID_B, 'Transizione', 'SOTTOMESSA', 'IN_TRIAGE', 'ok');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('ts_workflow_histories');
    const body = JSON.parse(init.body);
    expect(body['ts_richiesta@odata.bind']).toBe(`/ts_richiestes(${GUID_A})`);
    expect(body['ts_utente@odata.bind']).toBe(`/ts_utentis(${GUID_B})`);
    expect(body.ts_stato_precedente).toBe('SOTTOMESSA');
    expect(body.ts_stato_nuovo).toBe('IN_TRIAGE');
    expect(body.ts_data_azione).toBeTruthy();
  });
});

describe('getCurrentUser - anti-injection OData', () => {
  test('apice nell\'email escapato e filtro URL-encoded', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        value: [
          {
            ts_utenteid: GUID_A,
            ts_nome: 'Owen',
            ts_cognome: 'Neil',
            ts_email: "o'neil@uslnordovest.toscana.it",
            ts_ruolo: 'RESPONSABILE_UO',
            ts_attivo: true,
          },
        ],
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new DataverseClient();
    const user = await client.getCurrentUser();

    expect(user?.email).toBe("o'neil@uslnordovest.toscana.it");
    const url = String(fetchMock.mock.calls[0][0]);
    // l'apice deve arrivare raddoppiato ('' → %27%27) e il filtro encodato
    expect(url).toContain(encodeURIComponent("ts_email eq 'o''neil@uslnordovest.toscana.it'"));
    // nessuna creazione utente: un solo fetch
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
