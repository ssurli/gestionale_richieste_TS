/**
 * REPORT TRIMESTRALI E RENDICONTAZIONE
 */

import {
  TechnologyRequest,
  QuarterlyReport,
  TrackType,
  RequestStatus,
  User
} from '@/types';
import { calculateWorkflowStats } from './workflow';

/**
 * Genera report trimestrale
 */
export function generateQuarterlyReport(
  anno: number,
  trimestre: 1 | 2 | 3 | 4,
  requests: TechnologyRequest[],
  generatoDa: User
): QuarterlyReport {
  // Filtra richieste del trimestre
  const { dataInizio, dataFine } = getTrimestreRange(anno, trimestre);

  const richiesteDelTrimestre = requests.filter(req => {
    const data = new Date(req.dataCreazione);
    return data >= dataInizio && data <= dataFine;
  });

  // Calcola volumi per track
  const volumiPerTrack = Object.values(TrackType).map(track => {
    const richiesteTrack = richiesteDelTrimestre.filter(
      r => r.trackAssegnato === track
    );

    const approvate = richiesteTrack.filter(
      r => r.esitoFinale === 'APPROVATO'
    ).length;

    const respinte = richiesteTrack.filter(
      r => r.esitoFinale === 'RESPINTO'
    ).length;

    const rinviate = richiesteTrack.filter(
      r => r.esitoFinale === 'RINVIATO'
    ).length;

    const tempiApprovazione = richiesteTrack
      .filter(r => r.esitoFinale === 'APPROVATO' && r.dataAssegnazioneTrack)
      .map(r => {
        const dataApprovazione = r.dataApprovazioneDA || r.dataUltimaModifica;
        const dataAssegnazione = new Date(r.dataAssegnazioneTrack!);
        return Math.floor(
          (new Date(dataApprovazione).getTime() - dataAssegnazione.getTime()) /
          (1000 * 60 * 60 * 24)
        );
      });

    const tempoMedioGiorni =
      tempiApprovazione.length > 0
        ? tempiApprovazione.reduce((a, b) => a + b, 0) / tempiApprovazione.length
        : 0;

    return {
      track,
      totaleRichieste: richiesteTrack.length,
      approvate,
      respinte,
      rinviate,
      tempoMedioGiorni
    };
  });

  // Statistiche complessive
  const totaleRichieste = richiesteDelTrimestre.length;
  const totaleApprovate = richiesteDelTrimestre.filter(
    r => r.esitoFinale === 'APPROVATO'
  ).length;
  const totaleRespinte = richiesteDelTrimestre.filter(
    r => r.esitoFinale === 'RESPINTO'
  ).length;
  const totaleRinviate = richiesteDelTrimestre.filter(
    r => r.esitoFinale === 'RINVIATO'
  ).length;

  // Budget
  const budgetTotaleRichiesto = richiesteDelTrimestre.reduce(
    (sum, r) => sum + (r.budget?.valoreStimatoEuro || 0),
    0
  );

  const budgetTotaleApprovato = richiesteDelTrimestre
    .filter(r => r.esitoFinale === 'APPROVATO')
    .reduce((sum, r) => sum + (r.budget?.valoreStimatoEuro || 0), 0);

  // Identifica colli di bottiglia
  const workflowStats = calculateWorkflowStats(richiesteDelTrimestre);
  const colliBottiglia = workflowStats.bottlenecks.map(b => ({
    fase: b.status,
    descrizione: `Tempo medio: ${b.avgDays.toFixed(1)} giorni`,
    tempoMedioGiorni: b.avgDays,
    suggerimenti: getSuggerimentiPerFase(b.status, b.avgDays)
  }));

  // Genera raccomandazioni
  const raccomandazioni = generaRaccomandazioni(
    volumiPerTrack,
    colliBottiglia,
    totaleRichieste,
    totaleApprovate,
    totaleRespinte
  );

  return {
    id: generateReportId(anno, trimestre),
    anno,
    trimestre,
    dataGenerazione: new Date(),
    generatoDa,
    volumiPerTrack,
    totaleRichieste,
    totaleApprovate,
    totaleRespinte,
    totaleRinviate,
    budgetTotaleRichiesto,
    budgetTotaleApprovato,
    colliBottiglia,
    raccomandazioni
  };
}

/**
 * Ottieni range date trimestre
 */
function getTrimestreRange(anno: number, trimestre: 1 | 2 | 3 | 4): {
  dataInizio: Date;
  dataFine: Date;
} {
  const ranges = {
    1: { start: new Date(anno, 0, 1), end: new Date(anno, 2, 31) },
    2: { start: new Date(anno, 3, 1), end: new Date(anno, 5, 30) },
    3: { start: new Date(anno, 6, 1), end: new Date(anno, 8, 30) },
    4: { start: new Date(anno, 9, 1), end: new Date(anno, 11, 31) }
  };

  return {
    dataInizio: ranges[trimestre].start,
    dataFine: ranges[trimestre].end
  };
}

/**
 * Genera suggerimenti per fase workflow
 */
function getSuggerimentiPerFase(fase: string, tempoMedioGiorni: number): string {
  const suggerimenti: Record<string, string> = {
    [RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO]:
      'Automatizzare notifiche ai Direttori. Considerare delega per validazioni semplici.',
    [RequestStatus.IN_PRESCREENING]:
      'Aumentare risorse Coordinatore CommAz. Implementare checklist standardizzate.',
    [RequestStatus.IN_VALUTAZIONE_COMMAZ]:
      'Ottimizzare calendario riunioni CommAz. Preparare documentazione in anticipo.',
    [RequestStatus.IN_APPROVAZIONE_DS]:
      'Sessioni dedicate DS per approvazioni batch. Notifiche prioritarie.',
    [RequestStatus.IN_APPROVAZIONE_DA]:
      'Calendario fisso approvazioni DA. Pre-screening documentale.'
  };

  return (
    suggerimenti[fase] ||
    `Analizzare cause ritardo (${tempoMedioGiorni.toFixed(1)} gg medi).`
  );
}

/**
 * Genera raccomandazioni basate su analisi dati
 */
function generaRaccomandazioni(
  volumiPerTrack: any[],
  colliBottiglia: any[],
  totaleRichieste: number,
  totaleApprovate: number,
  totaleRespinte: number
): string[] {
  const raccomandazioni: string[] = [];

  // Analisi distribuzione track
  const track1Count = volumiPerTrack.find(v => v.track === TrackType.URGENZA_CRITICA)?.totaleRichieste || 0;
  if (track1Count > totaleRichieste * 0.2) {
    raccomandazioni.push(
      `⚠️ ATTENZIONE: ${track1Count} richieste urgenza critica (${((track1Count / totaleRichieste) * 100).toFixed(1)}% del totale). ` +
      'Verificare se criteri urgenza sono applicati correttamente o se esiste problema sistemico.'
    );
  }

  // Analisi tasso approvazione
  const tassoApprovazione = totaleRichieste > 0 ? (totaleApprovate / totaleRichieste) * 100 : 0;
  if (tassoApprovazione < 60) {
    raccomandazioni.push(
      `📊 Tasso approvazione basso (${tassoApprovazione.toFixed(1)}%). ` +
      'Migliorare formazione richiedenti su criteri eligibilità. Potenziare fase pre-screening.'
    );
  }

  // Analisi tempi medi per track
  volumiPerTrack.forEach(v => {
    const tempoMassimo = getTempoMassimoTrack(v.track);
    if (v.tempoMedioGiorni > tempoMassimo * 1.2) {
      raccomandazioni.push(
        `⏱️ Track ${v.track}: tempo medio ${v.tempoMedioGiorni.toFixed(1)} gg supera SLA (${tempoMassimo} gg). ` +
        'Ottimizzare processo o rivedere tempi target.'
      );
    }
  });

  // Analisi colli di bottiglia
  if (colliBottiglia.length > 0) {
    const topBottleneck = colliBottiglia[0];
    raccomandazioni.push(
      `🚧 Principale collo di bottiglia: ${topBottleneck.fase} (${topBottleneck.tempoMedioGiorni.toFixed(1)} gg medi). ` +
      topBottleneck.suggerimenti
    );
  }

  // Raccomandazioni positive
  if (tassoApprovazione >= 80) {
    raccomandazioni.push(
      `✅ Ottimo tasso approvazione (${tassoApprovazione.toFixed(1)}%). ` +
      'Sistema di pre-screening efficace. Mantenere standard qualitativi.'
    );
  }

  // Budget
  const budgetUtilization = volumiPerTrack.reduce(
    (sum, v) => sum + v.totaleRichieste,
    0
  );
  if (budgetUtilization > 0) {
    raccomandazioni.push(
      `💰 Budget: analizzare trend spesa per pianificazione budget prossimo anno.`
    );
  }

  return raccomandazioni;
}

function getTempoMassimoTrack(track: TrackType): number {
  const tempi: Record<TrackType, number> = {
    [TrackType.URGENZA_CRITICA]: 2,
    [TrackType.FAST_TRACK]: 7,
    [TrackType.SEMPLIFICATA]: 20,
    [TrackType.HTA_COMPLETO]: 45
  };
  return tempi[track];
}

function generateReportId(anno: number, trimestre: number): string {
  return `REPORT-${anno}-Q${trimestre}-${Date.now()}`;
}

/**
 * Esporta report in formato testo per PDF
 */
export function formatReportAsText(report: QuarterlyReport): string {
  let text = `
═══════════════════════════════════════════════════════════════
    REPORT TRIMESTRALE TECNOLOGIE SANITARIE
    Anno ${report.anno} - Trimestre ${report.trimestre}
═══════════════════════════════════════════════════════════════

Data Generazione: ${report.dataGenerazione.toLocaleDateString('it-IT')}
Generato da: ${report.generatoDa.nome} ${report.generatoDa.cognome}

──────────────────────────────────────────────────────────────
1. STATISTICHE GENERALI
──────────────────────────────────────────────────────────────

Totale Richieste:        ${report.totaleRichieste}
  ├─ Approvate:          ${report.totaleApprovate} (${((report.totaleApprovate / report.totaleRichieste) * 100).toFixed(1)}%)
  ├─ Respinte:           ${report.totaleRespinte} (${((report.totaleRespinte / report.totaleRichieste) * 100).toFixed(1)}%)
  └─ Rinviate:           ${report.totaleRinviate} (${((report.totaleRinviate / report.totaleRichieste) * 100).toFixed(1)}%)

Budget Totale Richiesto:  €${report.budgetTotaleRichiesto.toLocaleString('it-IT')}
Budget Totale Approvato:  €${report.budgetTotaleApprovato.toLocaleString('it-IT')}
Tasso Utilizzo Budget:    ${((report.budgetTotaleApprovato / report.budgetTotaleRichiesto) * 100).toFixed(1)}%

──────────────────────────────────────────────────────────────
2. DISTRIBUZIONE PER TRACK
──────────────────────────────────────────────────────────────
`;

  report.volumiPerTrack.forEach(v => {
    const tassoApprovazione = v.totaleRichieste > 0
      ? ((v.approvate / v.totaleRichieste) * 100).toFixed(1)
      : '0.0';

    text += `
${v.track}:
  Totale Richieste:      ${v.totaleRichieste}
  Approvate:             ${v.approvate} (${tassoApprovazione}%)
  Respinte:              ${v.respinte}
  Rinviate:              ${v.rinviate}
  Tempo Medio:           ${v.tempoMedioGiorni.toFixed(1)} giorni
`;
  });

  text += `
──────────────────────────────────────────────────────────────
3. COLLI DI BOTTIGLIA
──────────────────────────────────────────────────────────────
`;

  if (report.colliBottiglia.length === 0) {
    text += '\n✅ Nessun collo di bottiglia significativo identificato.\n';
  } else {
    report.colliBottiglia.forEach((c, i) => {
      text += `
${i + 1}. ${c.fase}
   ${c.descrizione}
   Suggerimenti: ${c.suggerimenti}
`;
    });
  }

  text += `
──────────────────────────────────────────────────────────────
4. RACCOMANDAZIONI
──────────────────────────────────────────────────────────────
`;

  report.raccomandazioni.forEach((r, i) => {
    text += `\n${i + 1}. ${r}\n`;
  });

  text += `
═══════════════════════════════════════════════════════════════
                    Fine Report
═══════════════════════════════════════════════════════════════
`;

  return text;
}

/**
 * Calcola trend rispetto trimestre precedente
 */
export function calculateTrends(
  currentReport: QuarterlyReport,
  previousReport: QuarterlyReport | null
): {
  richiesteVariazione: number;
  budgetVariazione: number;
  tassoApprovazioneVariazione: number;
  tempoMedioVariazione: number;
} {
  if (!previousReport) {
    return {
      richiesteVariazione: 0,
      budgetVariazione: 0,
      tassoApprovazioneVariazione: 0,
      tempoMedioVariazione: 0
    };
  }

  const richiesteVariazione =
    ((currentReport.totaleRichieste - previousReport.totaleRichieste) /
      previousReport.totaleRichieste) *
    100;

  const budgetVariazione =
    ((currentReport.budgetTotaleApprovato - previousReport.budgetTotaleApprovato) /
      previousReport.budgetTotaleApprovato) *
    100;

  const currentTassoApprovazione =
    (currentReport.totaleApprovate / currentReport.totaleRichieste) * 100;
  const prevTassoApprovazione =
    (previousReport.totaleApprovate / previousReport.totaleRichieste) * 100;
  const tassoApprovazioneVariazione =
    currentTassoApprovazione - prevTassoApprovazione;

  const currentTempoMedio =
    currentReport.volumiPerTrack.reduce((sum, v) => sum + v.tempoMedioGiorni, 0) /
    currentReport.volumiPerTrack.length;
  const prevTempoMedio =
    previousReport.volumiPerTrack.reduce((sum, v) => sum + v.tempoMedioGiorni, 0) /
    previousReport.volumiPerTrack.length;
  const tempoMedioVariazione =
    ((currentTempoMedio - prevTempoMedio) / prevTempoMedio) * 100;

  return {
    richiesteVariazione,
    budgetVariazione,
    tassoApprovazioneVariazione,
    tempoMedioVariazione
  };
}
