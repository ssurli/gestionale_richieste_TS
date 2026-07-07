/**
 * Test del triage Multi-Track (src/lib/triage.ts)
 *
 * I test marcati `test.fails` fotografano il COMPORTAMENTO DESIDERATO su bug
 * noti (finding F4, F5, F7 dell'analisi in docs/analisi-multiagente/):
 * oggi falliscono per costruzione e la PR-05 li farà passare, rimuovendo
 * il modificatore `.fails`.
 */

import { describe, test, expect } from 'vitest';
import {
  eseguiTriage,
  verificaServicePerTrack,
  verificaConsumabiliPerTrack,
  calcolaGiorniResidui,
  isInRitardo,
  getTempoMassimoTrack,
} from '@/lib/triage';
import {
  TechnologyRequest,
  TrackType,
  AcquisitionType,
  ServiceContract,
  Consumables,
} from '@/types';

// ---------------------------------------------------------------------------
// Helper: richiesta minima "neutra" (acquisto programmato ordinario)
// ---------------------------------------------------------------------------
function richiestaBase(overrides: Partial<TechnologyRequest> = {}): Partial<TechnologyRequest> {
  return {
    tipoAcquisto: AcquisitionType.PROGRAMMATO,
    isSostituzione: false,
    isDonazione: false,
    richiedeService: false,
    richiedeConsumabili: false,
    richiedeAdeguamentiStrutturali: false,
    studioFattibilitaRichiesto: false,
    richiedeHTARegionale: false,
    motivazioneRichiesta: 'Aggiornamento dotazione reparto',
    descrizioneDettagliata: 'Apparecchiatura standard',
    budget: {
      valoreStimatoEuro: 30000,
      ivaEsclusa: true,
      fonteFinanziamento: 'PIANO_INVESTIMENTI',
      annoRiferimento: new Date().getFullYear(),
      budgetDisponibile: true,
      richiestaIntegrazione: false,
      validatoUSLPM: false,
    },
    ...overrides,
  };
}

function serviceBase(overrides: Partial<ServiceContract> = {}): ServiceContract {
  return {
    serviceGiaAggiudicatoESTAR: true,
    numeroDeliberaESTAR: 'DEL-123',
    fornitore: 'Fornitore SpA',
    durataContrattualeAnni: 3,
    canoneAnnuo: 10000,
    valoreTotaleContratto: 30000,
    consumabiliInclusi: 'GENERICI',
    penaliUscitaAnticipata: false,
    tipoRichiestaService: 'RINNOVO',
    ...overrides,
  };
}

function consumabiliBase(overrides: Partial<Consumables> = {}): Consumables {
  return {
    consumabiliGiaGaraESTAR: true,
    numeroDeliberaESTAR: 'DEL-456',
    tipologia: 'Elettrodi',
    fornitore: 'Fornitore SpA',
    consumoAnnuoStimato: 10000,
    tipoConsumabile: 'GENERICI',
    motivazioneRichiesta: 'INCREMENTO_VOLUMI',
    percentualeIncremento: 10,
    esistonoAlternative: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Assegnazione track: regole stabili
// ---------------------------------------------------------------------------
describe('eseguiTriage - regole di assegnazione', () => {
  test('acquisto sotto soglia €15.000 → FAST_TRACK', () => {
    const r = richiestaBase({ budget: { ...richiestaBase().budget!, valoreStimatoEuro: 10000 } });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.FAST_TRACK);
  });

  test('sostituzione 1:1 → FAST_TRACK', () => {
    const r = richiestaBase({
      isSostituzione: true,
      tipoAcquisto: AcquisitionType.SOSTITUZIONE,
    });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.FAST_TRACK);
  });

  test('budget ≥ €100.000 → HTA_COMPLETO', () => {
    const r = richiestaBase({ budget: { ...richiestaBase().budget!, valoreStimatoEuro: 120000 } });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });

  test('nuova tecnologia non programmata → HTA_COMPLETO', () => {
    const r = richiestaBase({ tipoAcquisto: AcquisitionType.NON_PROGRAMMATO });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });

  test('adeguamenti strutturali richiesti → HTA_COMPLETO', () => {
    const r = richiestaBase({ richiedeAdeguamentiStrutturali: true });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });

  test('comodato → HTA_COMPLETO', () => {
    const r = richiestaBase({ tipoAcquisto: AcquisitionType.COMODATO });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });

  test('classe IIb/III innovativa (HTA regionale DGR 737/2022) → HTA_COMPLETO', () => {
    const r = richiestaBase({ richiedeHTARegionale: true });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });

  test('ampliamento dotazione programmato → SEMPLIFICATA', () => {
    const r = richiestaBase({ motivazioneRichiesta: 'Ampliamento dotazione ecografi del reparto' });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.SEMPLIFICATA);
  });

  test('donazione ≥ €50.000 → HTA_COMPLETO', () => {
    const r = richiestaBase({
      isDonazione: true,
      donazione: {
        donatoreIdentificato: true,
        valoreDonazione: 60000,
        materialiUsoDecicati: false,
        conformeDGR306: true,
        tecnologiaGiaAggiudicata: true,
        tecnologiaConosciuta: true,
        eligibileProceduraSemplificata: false,
      },
    });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });

  test('donazione €30.000 conforme e conosciuta → SEMPLIFICATA', () => {
    const r = richiestaBase({
      isDonazione: true,
      donazione: {
        donatoreIdentificato: true,
        valoreDonazione: 30000,
        materialiUsoDecicati: false,
        conformeDGR306: true,
        tecnologiaGiaAggiudicata: true,
        tecnologiaConosciuta: true,
        eligibileProceduraSemplificata: true,
      },
    });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.SEMPLIFICATA);
  });

  test('service NON aggiudicato ESTAR → HTA_COMPLETO', () => {
    const r = richiestaBase({
      richiedeService: true,
      service: serviceBase({ serviceGiaAggiudicatoESTAR: false }),
    });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });

  test('rinnovo service già aggiudicato ESTAR senza criticità → FAST_TRACK', () => {
    const r = richiestaBase({ richiedeService: true, service: serviceBase() });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.FAST_TRACK);
  });

  test('consumabili dedicati senza alternative → HTA_COMPLETO (vendor lock-in)', () => {
    const r = richiestaBase({
      richiedeConsumabili: true,
      consumabili: consumabiliBase({ tipoConsumabile: 'DEDICATI', esistonoAlternative: false }),
    });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });
});

// ---------------------------------------------------------------------------
// Soglie service/consumabili (DGR 306/2024, vendor lock-in)
// ---------------------------------------------------------------------------
describe('verificaServicePerTrack - soglie', () => {
  test('canone annuo > €30.000 → HTA completo', () => {
    expect(verificaServicePerTrack(serviceBase({ canoneAnnuo: 31000 })).passaHTACompleto).toBe(true);
  });

  test('durata > 5 anni → HTA completo', () => {
    expect(verificaServicePerTrack(serviceBase({ durataContrattualeAnni: 6 })).passaHTACompleto).toBe(true);
  });

  test('penali uscita > 30% → HTA completo', () => {
    expect(
      verificaServicePerTrack(
        serviceBase({ penaliUscitaAnticipata: true, percentualePenale: 35 })
      ).passaHTACompleto
    ).toBe(true);
  });

  test('prima attivazione (NUOVO) → HTA completo', () => {
    expect(verificaServicePerTrack(serviceBase({ tipoRichiestaService: 'NUOVO' })).passaHTACompleto).toBe(true);
  });

  test('consumabili inclusi DEDICATI → HTA completo', () => {
    expect(verificaServicePerTrack(serviceBase({ consumabiliInclusi: 'DEDICATI' })).passaHTACompleto).toBe(true);
  });

  test('rinnovo ESTAR sotto tutte le soglie → NON HTA completo', () => {
    expect(verificaServicePerTrack(serviceBase()).passaHTACompleto).toBe(false);
  });
});

describe('verificaConsumabiliPerTrack - soglie', () => {
  test('non a gara ESTAR → HTA completo', () => {
    expect(
      verificaConsumabiliPerTrack(consumabiliBase({ consumabiliGiaGaraESTAR: false })).passaHTACompleto
    ).toBe(true);
  });

  test('consumo annuo > €50.000 → HTA completo', () => {
    expect(
      verificaConsumabiliPerTrack(consumabiliBase({ consumoAnnuoStimato: 51000 })).passaHTACompleto
    ).toBe(true);
  });

  test('generici a gara ESTAR sotto soglia → NON HTA completo', () => {
    expect(verificaConsumabiliPerTrack(consumabiliBase()).passaHTACompleto).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SLA / scadenzario
// ---------------------------------------------------------------------------
describe('SLA per track', () => {
  test('tempi massimi per track: 2 / 7 / 20 / 45 giorni', () => {
    expect(getTempoMassimoTrack(TrackType.URGENZA_CRITICA)).toBe(2);
    expect(getTempoMassimoTrack(TrackType.FAST_TRACK)).toBe(7);
    expect(getTempoMassimoTrack(TrackType.SEMPLIFICATA)).toBe(20);
    expect(getTempoMassimoTrack(TrackType.HTA_COMPLETO)).toBe(45);
  });

  test('richiesta nei tempi: giorni residui positivi e non in ritardo', () => {
    const r = {
      trackAssegnato: TrackType.HTA_COMPLETO,
      dataAssegnazioneTrack: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    } as TechnologyRequest;
    expect(calcolaGiorniResidui(r)).toBe(35);
    expect(isInRitardo(r)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// BUG NOTI (comportamento desiderato) — da far passare con la PR-05
// ---------------------------------------------------------------------------
describe('bug noti da correggere (PR-05)', () => {
  // F7: calcolaGiorniResidui clampa a >= 0 (Math.max), quindi isInRitardo
  // (che confronta < 0) non può mai essere true.
  test.fails('F7: richiesta FAST_TRACK assegnata 30 giorni fa → in ritardo', () => {
    const r = {
      trackAssegnato: TrackType.FAST_TRACK,
      dataAssegnazioneTrack: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    } as TechnologyRequest;
    expect(isInRitardo(r)).toBe(true);
  });

  // F5: il criterio Fast Track "sotto €15.000" viene valutato prima delle
  // regole donazioni: una donazione da €10.000 salta la Procedura
  // Semplificata (e le verifiche DGR 306/2024).
  test.fails('F5: donazione €10.000 conforme → SEMPLIFICATA, non FAST_TRACK', () => {
    const r = richiestaBase({
      isDonazione: true,
      tipoAcquisto: AcquisitionType.DONAZIONE,
      budget: { ...richiestaBase().budget!, valoreStimatoEuro: 10000, fonteFinanziamento: 'DONAZIONE' },
      donazione: {
        donatoreIdentificato: true,
        valoreDonazione: 10000,
        materialiUsoDecicati: false,
        conformeDGR306: true,
        tecnologiaGiaAggiudicata: true,
        tecnologiaConosciuta: true,
        eligibileProceduraSemplificata: true,
      },
    });
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.SEMPLIFICATA);
  });

  // F4: il triage dell'urgenza critica usa keyword nel testo libero: una
  // negazione ("NON è un'emergenza") o una parola generica ("compliance")
  // forza il Track 1 (24-48h).
  test.fails('F4: negazione nel testo libero NON deve attivare URGENZA_CRITICA', () => {
    const r = richiestaBase({
      motivazioneRichiesta: 'Acquisto programmato, non è un\'emergenza',
    });
    expect(eseguiTriage(r).trackAssegnato).not.toBe(TrackType.URGENZA_CRITICA);
  });

  test.fails('F4: la parola "compliance" da sola NON deve attivare URGENZA_CRITICA', () => {
    const r = richiestaBase({
      motivazioneRichiesta: 'Migliora la compliance dei pazienti alla terapia',
    });
    expect(eseguiTriage(r).trackAssegnato).not.toBe(TrackType.URGENZA_CRITICA);
  });
});
