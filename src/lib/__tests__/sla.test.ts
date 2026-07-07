/**
 * Test dello scadenzario SLA e dei KPI (src/lib/sla.ts)
 */

import { describe, test, expect } from 'vitest';
import {
  getSlaStatus,
  codaPerTrack,
  aggregatoPerUnita,
  budgetAggregato,
  kpiPerTrack,
  percentualeInRitardo,
} from '@/lib/sla';
import { TechnologyRequest, RequestStatus, TrackType } from '@/types';

function giorniFa(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function req(overrides: Partial<TechnologyRequest>): TechnologyRequest {
  return {
    id: Math.random().toString(),
    statoCorrente: RequestStatus.IN_PRESCREENING,
    trackAssegnato: TrackType.FAST_TRACK,
    dataAssegnazioneTrack: giorniFa(1),
    unitaOperativa: 'UO A',
    dipartimento: 'Dip 1',
    budget: { valoreStimatoEuro: 1000 },
    ...overrides,
  } as unknown as TechnologyRequest;
}

describe('getSlaStatus', () => {
  test('richiesta appena assegnata → IN_TEMPO', () => {
    expect(getSlaStatus(req({ dataAssegnazioneTrack: giorniFa(1) }))).toBe('IN_TEMPO');
  });

  test('FAST_TRACK a 6 giorni (soglia scadenza) → IN_SCADENZA', () => {
    // FAST_TRACK: 7 gg, soglia = round(7*0.2)=1 → residui <=1 è scadenza; a 6gg residui=1
    expect(getSlaStatus(req({ dataAssegnazioneTrack: giorniFa(6) }))).toBe('IN_SCADENZA');
  });

  test('FAST_TRACK oltre 7 giorni → IN_RITARDO', () => {
    expect(getSlaStatus(req({ dataAssegnazioneTrack: giorniFa(30) }))).toBe('IN_RITARDO');
  });

  test('richiesta terminale → NON_APPLICABILE', () => {
    expect(
      getSlaStatus(req({ statoCorrente: RequestStatus.APPROVATA, dataAssegnazioneTrack: giorniFa(30) }))
    ).toBe('NON_APPLICABILE');
  });

  test('senza data assegnazione → NON_APPLICABILE', () => {
    expect(getSlaStatus(req({ dataAssegnazioneTrack: undefined }))).toBe('NON_APPLICABILE');
  });
});

describe('codaPerTrack', () => {
  test('conteggi per stato SLA sulle sole aperte', () => {
    const requests = [
      req({ trackAssegnato: TrackType.FAST_TRACK, dataAssegnazioneTrack: giorniFa(1) }), // in tempo
      req({ trackAssegnato: TrackType.FAST_TRACK, dataAssegnazioneTrack: giorniFa(30) }), // ritardo
      req({
        trackAssegnato: TrackType.FAST_TRACK,
        statoCorrente: RequestStatus.APPROVATA, // terminale, esclusa
        dataAssegnazioneTrack: giorniFa(30),
      }),
    ];
    const coda = codaPerTrack(requests).find((c) => c.track === TrackType.FAST_TRACK)!;
    expect(coda.totaleAperte).toBe(2);
    expect(coda.inTempo).toBe(1);
    expect(coda.inRitardo).toBe(1);
  });
});

describe('aggregatoPerUnita', () => {
  test('raggruppa per dipartimento/UO e ordina per ritardi', () => {
    const requests = [
      req({ unitaOperativa: 'UO A', dipartimento: 'Dip 1', dataAssegnazioneTrack: giorniFa(1) }),
      req({ unitaOperativa: 'UO B', dipartimento: 'Dip 1', dataAssegnazioneTrack: giorniFa(30) }),
      req({ unitaOperativa: 'UO B', dipartimento: 'Dip 1', dataAssegnazioneTrack: giorniFa(30) }),
    ];
    const righe = aggregatoPerUnita(requests);
    expect(righe).toHaveLength(2);
    // UO B (2 in ritardo) prima di UO A
    expect(righe[0].unita).toBe('UO B');
    expect(righe[0].inRitardo).toBe(2);
  });
});

describe('budgetAggregato', () => {
  test('separa richiesto / approvato / in valutazione / respinto', () => {
    const requests = [
      req({ statoCorrente: RequestStatus.APPROVATA, budget: { valoreStimatoEuro: 5000 } as any }),
      req({ statoCorrente: RequestStatus.IN_PRESCREENING, budget: { valoreStimatoEuro: 3000 } as any }),
      req({ statoCorrente: RequestStatus.RESPINTA, budget: { valoreStimatoEuro: 2000 } as any }),
    ];
    const b = budgetAggregato(requests);
    expect(b.richiestoTotale).toBe(10000);
    expect(b.approvato).toBe(5000);
    expect(b.inValutazione).toBe(3000);
    expect(b.respinto).toBe(2000);
  });
});

describe('kpiPerTrack / percentualeInRitardo', () => {
  test('percentuale in ritardo sulle aperte', () => {
    const requests = [
      req({ dataAssegnazioneTrack: giorniFa(1) }),
      req({ dataAssegnazioneTrack: giorniFa(30) }),
      req({ dataAssegnazioneTrack: giorniFa(30) }),
    ];
    // 2 su 3 aperte in ritardo ≈ 66.7%
    expect(Math.round(percentualeInRitardo(requests))).toBe(67);
  });

  test('aging medio e % ritardo per track', () => {
    const requests = [
      req({ trackAssegnato: TrackType.HTA_COMPLETO, dataAssegnazioneTrack: giorniFa(10) }),
      req({ trackAssegnato: TrackType.HTA_COMPLETO, dataAssegnazioneTrack: giorniFa(20) }),
    ];
    const kpi = kpiPerTrack(requests).find((k) => k.track === TrackType.HTA_COMPLETO)!;
    expect(kpi.totaleAperte).toBe(2);
    expect(kpi.agingMedioGiorni).toBe(15);
    expect(kpi.apertePerc).toBe(0); // HTA 45gg: nessuna in ritardo
  });
});
