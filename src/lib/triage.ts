/**
 * SISTEMA MULTI-TRACK - LOGICA DI TRIAGE
 * Determina automaticamente il track appropriato per ogni richiesta
 */

import {
  TechnologyRequest,
  TrackType,
  AcquisitionType,
  ServiceContract,
  Consumables,
  Donation
} from '@/types';

export interface TriageResult {
  trackAssegnato: TrackType;
  motivazione: string;
  criterioApplicato: string;
  flagAutomatico: boolean;
  warning?: string[];
}

/**
 * Esegue il triage della richiesta e assegna il track appropriato
 */
export function eseguiTriage(richiesta: Partial<TechnologyRequest>): TriageResult {
  // TRACK 1: URGENZA CRITICA (24-48h)
  const urgenzaCritica = verificaUrgenzaCritica(richiesta);
  if (urgenzaCritica) {
    return {
      trackAssegnato: TrackType.URGENZA_CRITICA,
      motivazione: urgenzaCritica.motivazione,
      criterioApplicato: urgenzaCritica.criterio,
      flagAutomatico: true
    };
  }

  // Verifica Service e Consumabili (potrebbero portare a HTA Completo)
  if (richiesta.richiedeService && richiesta.service) {
    const esitoService = verificaServicePerTrack(richiesta.service);
    if (esitoService.passaHTACompleto) {
      return {
        trackAssegnato: TrackType.HTA_COMPLETO,
        motivazione: `Service: ${esitoService.motivazione}`,
        criterioApplicato: 'Service con criticità',
        flagAutomatico: true
      };
    }
  }

  if (richiesta.richiedeConsumabili && richiesta.consumabili) {
    const esitoConsumabili = verificaConsumabiliPerTrack(richiesta.consumabili);
    if (esitoConsumabili.passaHTACompleto) {
      return {
        trackAssegnato: TrackType.HTA_COMPLETO,
        motivazione: `Consumabili: ${esitoConsumabili.motivazione}`,
        criterioApplicato: 'Consumabili con criticità',
        flagAutomatico: true
      };
    }
  }

  // DONAZIONI: regole dedicate DGR 306/2024, valutate PRIMA dei criteri
  // generici. Una donazione non deve mai cadere nel Fast Track "sotto
  // soglia": seguirebbe un percorso che salta le verifiche sulle donazioni.
  if (richiesta.isDonazione && richiesta.donazione) {
    return triageDonazione(richiesta.donazione);
  }

  // TRACK 4: HTA COMPLETO - Verifica criteri esclusivi
  const htaCompleto = verificaHTACompleto(richiesta);
  if (htaCompleto) {
    return {
      trackAssegnato: TrackType.HTA_COMPLETO,
      motivazione: htaCompleto.motivazione,
      criterioApplicato: htaCompleto.criterio,
      flagAutomatico: true
    };
  }

  // TRACK 2: FAST TRACK (5-7 giorni)
  const fastTrack = verificaFastTrack(richiesta);
  if (fastTrack) {
    return {
      trackAssegnato: TrackType.FAST_TRACK,
      motivazione: fastTrack.motivazione,
      criterioApplicato: fastTrack.criterio,
      flagAutomatico: true
    };
  }

  // TRACK 3: PROCEDURA SEMPLIFICATA (15-20 giorni)
  const semplificata = verificaProceduraSemplificata(richiesta);
  if (semplificata) {
    return {
      trackAssegnato: TrackType.SEMPLIFICATA,
      motivazione: semplificata.motivazione,
      criterioApplicato: semplificata.criterio,
      flagAutomatico: true,
      warning: semplificata.warnings
    };
  }

  // DEFAULT: HTA COMPLETO se non rientra in nessun altro track
  return {
    trackAssegnato: TrackType.HTA_COMPLETO,
    motivazione: 'Non rientra nei criteri di Fast Track o Procedura Semplificata',
    criterioApplicato: 'Default - valutazione completa necessaria',
    flagAutomatico: false
  };
}

/**
 * TRACK 1: Verifica criteri urgenza critica.
 *
 * Usa SOLO i flag strutturati dichiarati dal richiedente (e verificati dal
 * Coordinatore CommAz in triage). Il precedente keyword-matching sul testo
 * libero è stato rimosso: parole come "emergenza" o "compliance" nella
 * motivazione (anche in frasi negative) forzavano il Track 1 a 24-48h.
 */
function verificaUrgenzaCritica(
  richiesta: Partial<TechnologyRequest>
): { motivazione: string; criterio: string } | null {
  if (richiesta.urgenzaSafetyCritica) {
    return {
      motivazione: 'Safety critica con rischio immediato per pazienti',
      criterio: 'Urgenza Critica - Safety'
    };
  }

  if (richiesta.urgenzaBloccoServizio) {
    return {
      motivazione: 'Blocco servizio essenziale senza alternative',
      criterio: 'Urgenza Critica - Blocco Servizio'
    };
  }

  if (richiesta.urgenzaObbligoNormativo) {
    return {
      motivazione: 'Obbligo normativo urgente',
      criterio: 'Urgenza Critica - Obbligo Normativo'
    };
  }

  return null;
}

/**
 * DONAZIONI: triage dedicato (DGR 306/2024).
 * I warning normativi vengono SEMPRE restituiti al chiamante (prima
 * andavano persi: il warning veniva accodato e poi la funzione tornava null).
 * Il blocco formale delle donazioni vietate resta in validations.ts
 * (validaDGR306_2024 / validaCoerenzaRichiesta): qui si instrada il percorso.
 */
function triageDonazione(donazione: Donation): TriageResult {
  if (donazione.materialiUsoDecicati) {
    return {
      trackAssegnato: TrackType.HTA_COMPLETO,
      motivazione:
        'Donazione con materiali d\'uso dedicati: VIETATA da DGR 306/2024, da respingere salvo rimozione del vincolo',
      criterioApplicato: 'HTA Completo - Vincolo DGR 306/2024',
      flagAutomatico: true,
      warning: [
        '⚠️ VIOLAZIONE DGR 306/2024: vietate donazioni con materiale d\'uso dedicato'
      ]
    };
  }

  if (donazione.valoreDonazione >= 50000) {
    return {
      trackAssegnato: TrackType.HTA_COMPLETO,
      motivazione: `Donazione valore elevato (€${donazione.valoreDonazione} >= €50.000)`,
      criterioApplicato: 'HTA Completo - Donazione alto valore',
      flagAutomatico: true
    };
  }

  if (!donazione.tecnologiaGiaAggiudicata && !donazione.tecnologiaConosciuta) {
    return {
      trackAssegnato: TrackType.HTA_COMPLETO,
      motivazione: 'Donazione di tecnologia non conosciuta né aggiudicata: richiede valutazione completa',
      criterioApplicato: 'HTA Completo - Donazione tecnologia sconosciuta',
      flagAutomatico: true
    };
  }

  return {
    trackAssegnato: TrackType.SEMPLIFICATA,
    motivazione: `Donazione valore €${donazione.valoreDonazione} < €50.000, tecnologia conosciuta, conforme DGR 306/2024`,
    criterioApplicato: 'Procedura Semplificata - Donazione',
    flagAutomatico: true
  };
}

/**
 * TRACK 2: Verifica criteri Fast Track
 */
function verificaFastTrack(
  richiesta: Partial<TechnologyRequest>
): { motivazione: string; criterio: string } | null {
  // A - Sostituzioni 1:1 già aggiudicate. Il criterio richiede la conferma
  // esplicita che la tecnologia sia già aggiudicata ESTAR: senza, una
  // sostituzione che necessita di nuova gara passerebbe in 5-7gg senza istruttoria
  if (richiesta.isSostituzione &&
      richiesta.tipoAcquisto === AcquisitionType.SOSTITUZIONE &&
      richiesta.sostituzioneGiaAggiudicata) {
    return {
      motivazione: 'Sostituzione 1:1 apparecchiatura fuori uso, tecnologia già aggiudicata',
      criterio: 'Fast Track - Sostituzione già aggiudicata'
    };
  }

  // B - Urgenze operative con workaround
  if (richiesta.motivoSostituzione && richiesta.esistonoAlternative) {
    return {
      motivazione: 'Urgenza operativa con workaround temporaneo disponibile',
      criterio: 'Fast Track - Urgenza con workaround'
    };
  }

  // C - Upgrade obbligati
  if (richiesta.motivoSostituzione === 'UPGRADE_OBBLIGATO') {
    return {
      motivazione: 'Upgrade obbligato per fine supporto fornitore',
      criterio: 'Fast Track - Upgrade obbligato'
    };
  }

  // D - Sotto soglia economica €15.000
  if (richiesta.budget?.valoreStimatoEuro &&
      richiesta.budget.valoreStimatoEuro < 15000) {
    return {
      motivazione: `Valore sotto soglia (€${richiesta.budget.valoreStimatoEuro} < €15.000)`,
      criterio: 'Fast Track - Sotto soglia economica'
    };
  }

  // E - Prove/visioni tecnologia in gara ESTAR (da gestire con flag specifico)

  // F - Service già aggiudicato ESTAR
  if (richiesta.richiedeService &&
      richiesta.service?.serviceGiaAggiudicatoESTAR &&
      richiesta.service?.tipoRichiestaService === 'RINNOVO') {
    return {
      motivazione: 'Rinnovo service già aggiudicato ESTAR',
      criterio: 'Fast Track - Service ESTAR'
    };
  }

  // G - Consumabili già a gara ESTAR
  if (richiesta.richiedeConsumabili &&
      richiesta.consumabili?.consumabiliGiaGaraESTAR &&
      richiesta.consumabili?.motivazioneRichiesta === 'INCREMENTO_VOLUMI') {
    return {
      motivazione: 'Incremento volumi consumabili già a gara ESTAR',
      criterio: 'Fast Track - Consumabili ESTAR'
    };
  }

  return null;
}

/**
 * TRACK 3: Verifica criteri Procedura Semplificata
 */
function verificaProceduraSemplificata(
  richiesta: Partial<TechnologyRequest>
): { motivazione: string; criterio: string; warnings?: string[] } | null {
  const warnings: string[] = [];

  // NB: le donazioni NON passano da qui: hanno un triage dedicato
  // (triageDonazione) eseguito prima dei criteri generici.

  // B - Ampliamento dotazione
  if (richiesta.tipoAcquisto === AcquisitionType.PROGRAMMATO &&
      richiesta.motivazioneRichiesta?.toLowerCase().includes('ampliamento')) {
    return {
      motivazione: 'Ampliamento dotazione tecnologica esistente',
      criterio: 'Procedura Semplificata - Ampliamento',
      warnings
    };
  }

  // C - Upgrade funzionali programmabili
  if (richiesta.motivoSostituzione === 'UPGRADE_OBBLIGATO' &&
      richiesta.budget?.fonteFinanziamento === 'PIANO_INVESTIMENTI') {
    return {
      motivazione: 'Upgrade funzionale programmato nel piano investimenti',
      criterio: 'Procedura Semplificata - Upgrade',
      warnings
    };
  }

  return null;
}

/**
 * TRACK 4: Verifica criteri HTA Completo
 */
function verificaHTACompleto(
  richiesta: Partial<TechnologyRequest>
): { motivazione: string; criterio: string } | null {
  // Nuove tecnologie non aggiudicate
  if (richiesta.tipoAcquisto === AcquisitionType.NON_PROGRAMMATO &&
      !richiesta.isSostituzione) {
    return {
      motivazione: 'Nuova tecnologia non ancora aggiudicata',
      criterio: 'HTA Completo - Nuova tecnologia'
    };
  }

  // Alto impatto organizzativo
  if (richiesta.richiedeAdeguamentiStrutturali || richiesta.studioFattibilitaRichiesto) {
    return {
      motivazione: 'Alto impatto organizzativo/logistico - richiede adeguamenti strutturali',
      criterio: 'HTA Completo - Alto impatto'
    };
  }

  // NB: le donazioni (incluse quelle >= €50K o con materiali dedicati)
  // sono gestite a monte da triageDonazione.

  // Comodati con complessità contrattuale
  if (richiesta.tipoAcquisto === AcquisitionType.COMODATO) {
    return {
      motivazione: 'Comodato d\'uso con implicazioni contrattuali complesse',
      criterio: 'HTA Completo - Comodato'
    };
  }

  // Tecnologie innovative classe IIb/III
  if (richiesta.richiedeHTARegionale) {
    return {
      motivazione: 'Tecnologia innovativa classe IIb/III richiede HTA Regionale',
      criterio: 'HTA Completo - Innovativo DGR 737/2022'
    };
  }

  // Budget significativo
  if (richiesta.budget?.valoreStimatoEuro &&
      richiesta.budget.valoreStimatoEuro >= 100000) {
    return {
      motivazione: `Budget significativo (€${richiesta.budget.valoreStimatoEuro} >= €100.000)`,
      criterio: 'HTA Completo - Budget elevato'
    };
  }

  return null;
}

/**
 * Verifica Service per determinare track
 */
export function verificaServicePerTrack(service: ServiceContract): {
  passaHTACompleto: boolean;
  motivazione: string;
} {
  // Service NON aggiudicato ESTAR
  if (!service.serviceGiaAggiudicatoESTAR) {
    return {
      passaHTACompleto: true,
      motivazione: 'Service non ancora aggiudicato ESTAR'
    };
  }

  // Consumabili dedicati
  if (service.consumabiliInclusi === 'DEDICATI') {
    return {
      passaHTACompleto: true,
      motivazione: 'Service con consumabili dedicati - rischio vendor lock-in'
    };
  }

  // Valore annuo elevato
  if (service.canoneAnnuo > 30000) {
    return {
      passaHTACompleto: true,
      motivazione: `Valore annuo service elevato (€${service.canoneAnnuo} > €30.000)`
    };
  }

  // Durata contrattuale lunga
  if (service.durataContrattualeAnni > 5) {
    return {
      passaHTACompleto: true,
      motivazione: `Durata contrattuale eccessiva (${service.durataContrattualeAnni} anni > 5 anni)`
    };
  }

  // Penali elevate
  if (service.penaliUscitaAnticipata &&
      service.percentualePenale &&
      service.percentualePenale > 30) {
    return {
      passaHTACompleto: true,
      motivazione: `Penali uscita elevate (${service.percentualePenale}% > 30%)`
    };
  }

  // Prima attivazione (non rinnovo)
  if (service.tipoRichiestaService === 'NUOVO') {
    return {
      passaHTACompleto: true,
      motivazione: 'Prima attivazione service - richiede valutazione approfondita'
    };
  }

  return {
    passaHTACompleto: false,
    motivazione: 'Service eligibile per Fast Track o Procedura Semplificata'
  };
}

/**
 * Verifica Consumabili per determinare track
 */
export function verificaConsumabiliPerTrack(consumabili: Consumables): {
  passaHTACompleto: boolean;
  motivazione: string;
} {
  // Consumabili NON a gara ESTAR
  if (!consumabili.consumabiliGiaGaraESTAR) {
    return {
      passaHTACompleto: true,
      motivazione: 'Consumabili non ancora in gara ESTAR'
    };
  }

  // Consumabili dedicati - vendor lock-in
  if (consumabili.tipoConsumabile === 'DEDICATI' && !consumabili.esistonoAlternative) {
    return {
      passaHTACompleto: true,
      motivazione: 'Consumabili dedicati senza alternative di mercato - vendor lock-in'
    };
  }

  // Consumo annuo elevato
  if (consumabili.consumoAnnuoStimato > 50000) {
    return {
      passaHTACompleto: true,
      motivazione: `Consumo annuo elevato (€${consumabili.consumoAnnuoStimato} > €50.000)`
    };
  }

  return {
    passaHTACompleto: false,
    motivazione: 'Consumabili eligibili per Fast Track o Procedura Semplificata'
  };
}

/**
 * Calcola i giorni residui per completare il track.
 * Un valore NEGATIVO indica i giorni di ritardo: il precedente clamp a >= 0
 * (Math.max) rendeva isInRitardo sempre falso e lo scadenzario inoperante.
 * NB: giorni di calendario (giorni lavorativi: ASSUNZIONE DA VERIFICARE
 * con il regolamento aziendale).
 */
export function calcolaGiorniResidui(
  richiesta: TechnologyRequest
): number {
  if (!richiesta.trackAssegnato || !richiesta.dataAssegnazioneTrack) {
    return 0;
  }

  const oggi = new Date();
  const dataAssegnazione = new Date(richiesta.dataAssegnazioneTrack);
  const giorniPassati = Math.floor(
    (oggi.getTime() - dataAssegnazione.getTime()) / (1000 * 60 * 60 * 24)
  );

  const tempoMassimo = getTempoMassimoTrack(richiesta.trackAssegnato);
  return tempoMassimo - giorniPassati;
}

/**
 * Ottieni tempo massimo per track
 */
export function getTempoMassimoTrack(track: TrackType): number {
  const tempi: Record<TrackType, number> = {
    [TrackType.URGENZA_CRITICA]: 2,
    [TrackType.FAST_TRACK]: 7,
    [TrackType.SEMPLIFICATA]: 20,
    [TrackType.HTA_COMPLETO]: 45
  };
  return tempi[track];
}

/**
 * Verifica se la richiesta è in ritardo
 */
export function isInRitardo(richiesta: TechnologyRequest): boolean {
  return calcolaGiorniResidui(richiesta) < 0;
}

/**
 * Override manuale del track da parte del Coordinatore CommAz.
 * L'esito del triage automatico resta tracciato nel criterio applicato e
 * la motivazione è OBBLIGATORIA (da persistere in
 * motivazioneAssegnazioneTrack, assieme a coordinatoreCommAzId e
 * dataTriageCoordCommAz, per l'audit).
 */
export function overrideTrackManuale(
  triageAutomatico: TriageResult,
  nuovoTrack: TrackType,
  motivazione: string
): TriageResult {
  const testo = motivazione.trim();
  if (testo.length < 10) {
    throw new Error(
      'L\'override manuale del track richiede una motivazione di almeno 10 caratteri'
    );
  }

  return {
    trackAssegnato: nuovoTrack,
    motivazione: testo,
    criterioApplicato: `Override manuale del Coordinatore (triage automatico: ${triageAutomatico.trackAssegnato} — ${triageAutomatico.criterioApplicato})`,
    flagAutomatico: false,
    warning: triageAutomatico.warning
  };
}
