/**
 * Test del servizio di sottomissione (src/lib/requestService.ts):
 * validazioni bloccanti, triage, persistenza e audit obbligatorio con
 * compensazione. dataverseClient è mockato.
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { TrackType, AcquisitionType, TechnologyRequest } from '@/types';

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  createRequest: vi.fn(),
  addWorkflowHistory: vi.fn(),
  deleteRequest: vi.fn(),
  getRequests: vi.fn(),
}));

vi.mock('@/lib/dataverseClient', () => ({
  dataverseClient: mocks,
}));

import { submitTechnologyRequest, loadRequests } from '@/lib/requestService';

const UTENTE = { id: '11111111-1111-1111-1111-111111111111', nome: 'Mario' };
const RICHIESTA_ID = '22222222-2222-2222-2222-222222222222';

function richiestaValida(): Partial<TechnologyRequest> {
  return {
    tipoAcquisto: AcquisitionType.PROGRAMMATO,
    isSostituzione: false,
    isDonazione: false,
    richiedeService: false,
    richiedeConsumabili: false,
    richiedeAdeguamentiStrutturali: false,
    nomeApparecchiatura: 'Elettrocardiografo',
    descrizioneDettagliata: 'ECG 12 derivazioni',
    motivazioneRichiesta: 'Incremento attività ambulatoriale',
    unitaOperativa: 'Cardiologia',
    dipartimento: 'Dipartimento Medico',
    budget: {
      valoreStimatoEuro: 12000,
      ivaEsclusa: true,
      fonteFinanziamento: 'PIANO_INVESTIMENTI',
      annoRiferimento: new Date().getFullYear(),
      budgetDisponibile: true,
      richiestaIntegrazione: false,
      validatoUSLPM: false,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getCurrentUser.mockResolvedValue(UTENTE);
  mocks.createRequest.mockResolvedValue(RICHIESTA_ID);
  mocks.addWorkflowHistory.mockResolvedValue(undefined);
  mocks.deleteRequest.mockResolvedValue(undefined);
});

describe('submitTechnologyRequest - percorso felice', () => {
  test('valida, triaggia, persiste e scrive l\'audit trail', async () => {
    const esito = await submitTechnologyRequest(richiestaValida());

    expect(esito.id).toBe(RICHIESTA_ID);
    expect(esito.triage.trackAssegnato).toBe(TrackType.FAST_TRACK); // sotto €15K

    // il record persistito contiene stato, track e motivazione triage
    const record = mocks.createRequest.mock.calls[0][0];
    expect(record.statoCorrente).toBe('SOTTOMESSA');
    expect(record.trackAssegnato).toBe(TrackType.FAST_TRACK);
    expect(record.richiedenteId).toBe(UTENTE.id);
    expect(record.dataAssegnazioneTrack).toBeInstanceOf(Date);
    expect(record.motivazioneAssegnazioneTrack).toBeTruthy();

    // audit trail con attore e stato nuovo
    expect(mocks.addWorkflowHistory).toHaveBeenCalledWith(
      RICHIESTA_ID,
      UTENTE.id,
      'Richiesta sottomessa',
      undefined,
      'SOTTOMESSA',
      expect.stringContaining('Triage automatico')
    );
    expect(mocks.deleteRequest).not.toHaveBeenCalled();
  });
});

describe('submitTechnologyRequest - audit obbligatorio', () => {
  test('audit fallito → compensazione (delete) e sottomissione fallita', async () => {
    mocks.addWorkflowHistory.mockRejectedValue(new Error('permesso negato'));

    await expect(submitTechnologyRequest(richiestaValida())).rejects.toThrow(
      /audit trail/
    );
    expect(mocks.deleteRequest).toHaveBeenCalledWith(RICHIESTA_ID);
  });

  test('audit e compensazione falliti → errore con id orfano segnalato', async () => {
    mocks.addWorkflowHistory.mockRejectedValue(new Error('permesso negato'));
    mocks.deleteRequest.mockRejectedValue(new Error('anche delete negato'));

    await expect(submitTechnologyRequest(richiestaValida())).rejects.toThrow(
      new RegExp(RICHIESTA_ID)
    );
  });
});

describe('submitTechnologyRequest - validazioni bloccanti', () => {
  test('donazione con materiali dedicati → rifiutata PRIMA della persistenza', async () => {
    const dati: Partial<TechnologyRequest> = {
      ...richiestaValida(),
      isDonazione: true,
      tipoAcquisto: AcquisitionType.DONAZIONE,
      donazione: {
        donatoreIdentificato: true,
        valoreDonazione: 20000,
        materialiUsoDecicati: true,
        conformeDGR306: false,
        tecnologiaGiaAggiudicata: true,
        tecnologiaConosciuta: true,
        eligibileProceduraSemplificata: false,
      },
      budget: { ...richiestaValida().budget!, fonteFinanziamento: 'DONAZIONE' },
    };

    await expect(submitTechnologyRequest(dati)).rejects.toThrow(/DGR 306\/2024/);
    expect(mocks.createRequest).not.toHaveBeenCalled();
  });

  test('budget con anno passato → rifiutato prima della persistenza', async () => {
    const dati = richiestaValida();
    dati.budget!.annoRiferimento = new Date().getFullYear() - 1;

    await expect(submitTechnologyRequest(dati)).rejects.toThrow(/Budget non valido/);
    expect(mocks.createRequest).not.toHaveBeenCalled();
  });

  test('utente non autenticato → errore esplicito', async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    await expect(submitTechnologyRequest(richiestaValida())).rejects.toThrow(/login/);
    expect(mocks.createRequest).not.toHaveBeenCalled();
  });
});

describe('loadRequests', () => {
  test('delega a dataverseClient.getRequests', async () => {
    mocks.getRequests.mockResolvedValue([]);
    await expect(loadRequests()).resolves.toEqual([]);
    expect(mocks.getRequests).toHaveBeenCalled();
  });
});
