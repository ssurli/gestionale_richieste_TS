/**
 * VALIDAZIONI - Service, Consumabili, DGR 306/2024
 */

import { ServiceContract, Consumables, Donation, BudgetCoverage } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida conformità DGR 306/2024 per donazioni
 * VINCOLO: Vietate donazioni di apparecchiature con materiale d'uso dedicato
 */
export function validaDGR306_2024(donazione: Donation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (donazione.materialiUsoDecicati) {
    errors.push(
      '❌ VIOLAZIONE DGR 306/2024: Vietate donazioni con materiale d\'uso dedicato'
    );
    errors.push(
      'La donazione deve essere rifiutata o il fornitore deve garantire materiali compatibili con mercato libero'
    );
  }

  // Se il donatore non è trasparente
  if (!donazione.donatoreIdentificato) {
    errors.push('Il donatore deve essere identificato e trasparente');
  }

  // Validazione valore donazione
  if (donazione.valoreDonazione <= 0) {
    errors.push('Il valore della donazione deve essere maggiore di zero');
  }

  // Warning per donazioni di alto valore
  if (donazione.valoreDonazione >= 50000) {
    warnings.push(
      `⚠️ Donazione di valore elevato (€${donazione.valoreDonazione}) - richiede HTA Completo`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida contratto service per vendor lock-in e criticità
 */
export function validaServiceContract(service: ServiceContract): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validazione dati obbligatori
  if (!service.fornitore) {
    errors.push('Il fornitore deve essere specificato');
  }

  if (service.canoneAnnuo <= 0) {
    errors.push('Il canone annuo deve essere maggiore di zero');
  }

  if (service.durataContrattualeAnni <= 0) {
    errors.push('La durata contrattuale deve essere maggiore di zero');
  }

  // Validazione service ESTAR
  if (!service.serviceGiaAggiudicatoESTAR) {
    warnings.push(
      '⚠️ Service NON ancora aggiudicato ESTAR - richiede HTA Completo'
    );
  } else {
    if (!service.numeroDeliberaESTAR) {
      errors.push('Per service ESTAR è obbligatorio il numero delibera');
    }
  }

  // Criticità vendor lock-in con consumabili dedicati
  if (service.consumabiliInclusi === 'DEDICATI') {
    warnings.push(
      '⚠️ VENDOR LOCK-IN: Service con consumabili dedicati - verifica alternative di mercato'
    );
    warnings.push(
      'Se donazione con consumabili dedicati: VIETATO da DGR 306/2024'
    );
  }

  // Criticità valore annuo elevato
  if (service.canoneAnnuo > 30000) {
    warnings.push(
      `⚠️ Valore annuo elevato (€${service.canoneAnnuo}) - richiede HTA Completo`
    );
  }

  // Criticità durata contrattuale
  if (service.durataContrattualeAnni > 5) {
    warnings.push(
      `⚠️ Durata contrattuale eccessiva (${service.durataContrattualeAnni} anni) - rischio lock-in lungo termine`
    );
  }

  // Criticità penali uscita
  if (service.penaliUscitaAnticipata) {
    if (!service.percentualePenale || service.percentualePenale <= 0) {
      errors.push('Specificare la percentuale delle penali di uscita');
    } else if (service.percentualePenale > 30) {
      warnings.push(
        `⚠️ Penali uscita elevate (${service.percentualePenale}%) - vincolo contrattuale forte`
      );
    }
  }

  // Validazione coerenza tipo richiesta
  if (service.tipoRichiestaService === 'RINNOVO' && !service.serviceGiaAggiudicatoESTAR) {
    errors.push('Un rinnovo richiede un service già aggiudicato ESTAR');
  }

  // Calcolo valore totale contratto
  const valoreTotaleCalcolato = service.canoneAnnuo * service.durataContrattualeAnni;
  if (Math.abs(service.valoreTotaleContratto - valoreTotaleCalcolato) > 1) {
    errors.push(
      `Valore totale contratto non coerente (dichiarato: €${service.valoreTotaleContratto}, calcolato: €${valoreTotaleCalcolato})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida consumabili per criticità vendor lock-in
 */
export function validaConsumabili(consumabili: Consumables): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validazione dati obbligatori
  if (!consumabili.tipologia) {
    errors.push('La tipologia di consumabili deve essere specificata');
  }

  if (!consumabili.fornitore) {
    errors.push('Il fornitore deve essere specificato');
  }

  if (consumabili.consumoAnnuoStimato <= 0) {
    errors.push('Il consumo annuo stimato deve essere maggiore di zero');
  }

  // Validazione gara ESTAR
  if (!consumabili.consumabiliGiaGaraESTAR) {
    warnings.push(
      '⚠️ Consumabili NON in gara ESTAR - richiede HTA Completo'
    );
  } else {
    if (!consumabili.numeroDeliberaESTAR) {
      errors.push('Per consumabili ESTAR è obbligatorio il numero delibera');
    }
  }

  // Criticità consumabili dedicati
  if (consumabili.tipoConsumabile === 'DEDICATI') {
    warnings.push(
      '⚠️ VENDOR LOCK-IN: Consumabili dedicati - compatibili solo con tecnologia specifica'
    );

    if (!consumabili.esistonoAlternative) {
      warnings.push(
        '⚠️ VENDOR LOCK-IN CRITICO: Fornitore unico senza alternative di mercato'
      );
      warnings.push(
        'Valutare impatto economico a lungo termine e rischi supply chain'
      );
    }
  }

  // Criticità consumo annuo elevato
  if (consumabili.consumoAnnuoStimato > 50000) {
    warnings.push(
      `⚠️ Consumo annuo elevato (€${consumabili.consumoAnnuoStimato}) - impatto significativo su budget corrente`
    );
  }

  // Validazione motivazione richiesta
  if (consumabili.motivazioneRichiesta === 'INCREMENTO_VOLUMI') {
    if (!consumabili.percentualeIncremento || consumabili.percentualeIncremento <= 0) {
      errors.push('Per incremento volumi specificare la percentuale di incremento');
    } else if (consumabili.percentualeIncremento > 50) {
      warnings.push(
        `⚠️ Incremento volumi significativo (+${consumabili.percentualeIncremento}%) - verificare sostenibilità organizzativa`
      );
    }
  }

  if (consumabili.motivazioneRichiesta === 'ALTRO' && !consumabili.altroMotivo) {
    errors.push('Specificare la motivazione per "Altro"');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida budget e copertura finanziaria
 */
export function validaBudget(budget: BudgetCoverage): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validazione valore
  if (budget.valoreStimatoEuro <= 0) {
    errors.push('Il valore stimato deve essere maggiore di zero');
  }

  // Validazione fonte finanziamento
  if (!budget.fonteFinanziamento) {
    errors.push('La fonte di finanziamento deve essere specificata');
  }

  if (budget.fonteFinanziamento === 'ALTRO' && !budget.dettaglioFonte) {
    errors.push('Specificare il dettaglio della fonte di finanziamento');
  }

  // Validazione disponibilità budget
  if (!budget.budgetDisponibile) {
    warnings.push('⚠️ Budget attualmente non disponibile');

    if (!budget.richiestaIntegrazione) {
      errors.push('Se il budget non è disponibile, è necessario richiedere integrazione');
    } else if (!budget.importoIntegrazione || budget.importoIntegrazione <= 0) {
      errors.push('Specificare l\'importo dell\'integrazione richiesta');
    }
  }

  // Validazione budget disponibile vs valore richiesto
  if (budget.budgetDisponibile && budget.importoDisponibile) {
    if (budget.importoDisponibile < budget.valoreStimatoEuro) {
      const differenza = budget.valoreStimatoEuro - budget.importoDisponibile;
      warnings.push(
        `⚠️ Budget disponibile insufficiente (mancano €${differenza.toFixed(2)})`
      );

      if (!budget.richiestaIntegrazione) {
        errors.push('Budget insufficiente: è necessario richiedere integrazione');
      }
    }
  }

  // Validazione anno riferimento
  const annoCorrente = new Date().getFullYear();
  if (budget.annoRiferimento < annoCorrente) {
    errors.push(`Anno di riferimento non valido (${budget.annoRiferimento} < ${annoCorrente})`);
  }

  // Warning per fondi statali
  if (budget.fonteFinanziamento === 'FONDI_STATALI' && !budget.dettaglioFonte) {
    warnings.push('⚠️ Per fondi statali specificare riferimenti normativi (es. art. 20 L. 67/88)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Valida coerenza complessiva richiesta
 */
export function validaCoerenzaRichiesta(richiesta: {
  isDonazione: boolean;
  donazione?: Donation;
  richiedeService: boolean;
  service?: ServiceContract;
  richiedeConsumabili: boolean;
  consumabili?: Consumables;
  budget: BudgetCoverage;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validazione donazione + service con consumabili dedicati
  if (richiesta.isDonazione &&
      richiesta.donazione &&
      richiesta.richiedeService &&
      richiesta.service?.consumabiliInclusi === 'DEDICATI') {
    errors.push(
      '❌ VIOLAZIONE DGR 306/2024: Donazione con service che include consumabili dedicati VIETATA'
    );
  }

  // Validazione donazione + consumabili dedicati
  if (richiesta.isDonazione &&
      richiesta.donazione?.materialiUsoDecicati) {
    errors.push(
      '❌ VIOLAZIONE DGR 306/2024: Donazione con materiali d\'uso dedicati VIETATA'
    );
  }

  // Validazione budget per donazione
  if (richiesta.isDonazione &&
      richiesta.budget.fonteFinanziamento !== 'DONAZIONE') {
    warnings.push(
      '⚠️ Per donazioni, la fonte di finanziamento dovrebbe essere "DONAZIONE"'
    );
  }

  // Validazione service + consumabili (possibile duplicazione)
  if (richiesta.richiedeService &&
      richiesta.service?.consumabiliInclusi !== 'NESSUNO' &&
      richiesta.richiedeConsumabili) {
    warnings.push(
      '⚠️ ATTENZIONE: Service include già consumabili. Verificare se la richiesta consumabili separata è necessaria.'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
