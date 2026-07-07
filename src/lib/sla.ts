/**
 * SCADENZARIO SLA E KPI
 *
 * Funzioni pure sullo stato delle richieste: semaforo SLA per track,
 * aggregazioni per UO/dipartimento, indicatori di budget e KPI.
 * Nessun accesso a rete o stato: tutto derivato da TechnologyRequest[].
 */

import { TechnologyRequest, RequestStatus, TrackType } from '@/types';
import { calcolaGiorniResidui } from './triage';

export type SlaStatus = 'IN_TEMPO' | 'IN_SCADENZA' | 'IN_RITARDO' | 'NON_APPLICABILE';

/** Stati terminali: SLA non più applicabile */
const STATI_TERMINALI: RequestStatus[] = [
  RequestStatus.APPROVATA,
  RequestStatus.RESPINTA,
  RequestStatus.COMPLETATA,
];

export function isTerminale(r: TechnologyRequest): boolean {
  return STATI_TERMINALI.includes(r.statoCorrente);
}

export function isAperta(r: TechnologyRequest): boolean {
  return !isTerminale(r);
}

/**
 * Semaforo SLA di una richiesta aperta.
 * - IN_RITARDO: giorni residui < 0 (oltre SLA)
 * - IN_SCADENZA: entro la soglia di preavviso (default 20% del tempo di track,
 *   minimo 1 giorno)
 * - IN_TEMPO: altrimenti
 * - NON_APPLICABILE: richiesta terminale o senza track/data assegnazione
 */
export function getSlaStatus(r: TechnologyRequest): SlaStatus {
  if (isTerminale(r) || !r.trackAssegnato || !r.dataAssegnazioneTrack) {
    return 'NON_APPLICABILE';
  }
  const residui = calcolaGiorniResidui(r);
  if (residui < 0) return 'IN_RITARDO';

  const soglia = sogliaScadenza(r.trackAssegnato);
  if (residui <= soglia) return 'IN_SCADENZA';
  return 'IN_TEMPO';
}

function sogliaScadenza(track: TrackType): number {
  const tempi: Record<TrackType, number> = {
    [TrackType.URGENZA_CRITICA]: 2,
    [TrackType.FAST_TRACK]: 7,
    [TrackType.SEMPLIFICATA]: 20,
    [TrackType.HTA_COMPLETO]: 45,
  };
  return Math.max(1, Math.round(tempi[track] * 0.2));
}

// ---------------------------------------------------------------------------
// Coda per track
// ---------------------------------------------------------------------------

export interface CodaTrack {
  track: TrackType;
  totaleAperte: number;
  inTempo: number;
  inScadenza: number;
  inRitardo: number;
}

export function codaPerTrack(requests: TechnologyRequest[]): CodaTrack[] {
  return Object.values(TrackType).map((track) => {
    const aperte = requests.filter((r) => r.trackAssegnato === track && isAperta(r));
    return {
      track,
      totaleAperte: aperte.length,
      inTempo: aperte.filter((r) => getSlaStatus(r) === 'IN_TEMPO').length,
      inScadenza: aperte.filter((r) => getSlaStatus(r) === 'IN_SCADENZA').length,
      inRitardo: aperte.filter((r) => getSlaStatus(r) === 'IN_RITARDO').length,
    };
  });
}

// ---------------------------------------------------------------------------
// Vista per UO / dipartimento
// ---------------------------------------------------------------------------

export interface RigaUnita {
  unita: string;
  dipartimento: string;
  totaleAperte: number;
  inRitardo: number;
  budgetRichiesto: number;
}

export function aggregatoPerUnita(requests: TechnologyRequest[]): RigaUnita[] {
  const mappa = new Map<string, RigaUnita>();

  for (const r of requests) {
    const unita = r.unitaOperativa || '(non specificata)';
    const dipartimento = r.dipartimento || '(non specificato)';
    const key = `${dipartimento}||${unita}`;

    const riga =
      mappa.get(key) ??
      { unita, dipartimento, totaleAperte: 0, inRitardo: 0, budgetRichiesto: 0 };

    if (isAperta(r)) {
      riga.totaleAperte += 1;
      if (getSlaStatus(r) === 'IN_RITARDO') riga.inRitardo += 1;
    }
    riga.budgetRichiesto += r.budget?.valoreStimatoEuro || 0;

    mappa.set(key, riga);
  }

  return Array.from(mappa.values()).sort(
    (a, b) => b.inRitardo - a.inRitardo || b.totaleAperte - a.totaleAperte
  );
}

// ---------------------------------------------------------------------------
// Budget
// ---------------------------------------------------------------------------

export interface BudgetAggregato {
  richiestoTotale: number;   // tutte le richieste
  approvato: number;         // richieste in stato APPROVATA
  inValutazione: number;     // aperte (non terminali)
  respinto: number;          // richieste RESPINTA
}

export function budgetAggregato(requests: TechnologyRequest[]): BudgetAggregato {
  const somma = (predicate: (r: TechnologyRequest) => boolean) =>
    requests.filter(predicate).reduce((s, r) => s + (r.budget?.valoreStimatoEuro || 0), 0);

  return {
    richiestoTotale: somma(() => true),
    approvato: somma((r) => r.statoCorrente === RequestStatus.APPROVATA),
    inValutazione: somma((r) => isAperta(r)),
    respinto: somma((r) => r.statoCorrente === RequestStatus.RESPINTA),
  };
}

// ---------------------------------------------------------------------------
// KPI
// ---------------------------------------------------------------------------

export interface KpiTrack {
  track: TrackType;
  apertePerc: number;       // % richieste aperte in ritardo
  totaleAperte: number;
  agingMedioGiorni: number; // età media delle aperte (da assegnazione track)
}

/**
 * KPI operativi per track sulle sole richieste aperte:
 * - % in ritardo (SLA)
 * - aging medio in giorni
 */
export function kpiPerTrack(requests: TechnologyRequest[]): KpiTrack[] {
  return Object.values(TrackType).map((track) => {
    const aperte = requests.filter((r) => r.trackAssegnato === track && isAperta(r));
    const inRitardo = aperte.filter((r) => getSlaStatus(r) === 'IN_RITARDO').length;
    const aging = aperte
      .filter((r) => r.dataAssegnazioneTrack)
      .map((r) =>
        Math.floor(
          (Date.now() - new Date(r.dataAssegnazioneTrack!).getTime()) / (1000 * 60 * 60 * 24)
        )
      );
    const agingMedio =
      aging.length > 0 ? aging.reduce((a, b) => a + b, 0) / aging.length : 0;

    return {
      track,
      totaleAperte: aperte.length,
      apertePerc: aperte.length > 0 ? (inRitardo / aperte.length) * 100 : 0,
      agingMedioGiorni: Math.round(agingMedio),
    };
  });
}

/** % complessiva di richieste aperte in ritardo (fotografia operativa) */
export function percentualeInRitardo(requests: TechnologyRequest[]): number {
  const aperte = requests.filter(isAperta);
  if (aperte.length === 0) return 0;
  const inRitardo = aperte.filter((r) => getSlaStatus(r) === 'IN_RITARDO').length;
  return (inRitardo / aperte.length) * 100;
}
