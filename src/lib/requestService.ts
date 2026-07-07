/**
 * SERVIZIO SOTTOMISSIONE RICHIESTE
 *
 * Percorso unico form → validazioni → triage → persistenza Dataverse
 * → audit trail. L'audit è OBBLIGATORIO: se la scrittura della voce di
 * workflow history fallisce, la richiesta appena creata viene rimossa
 * (compensazione) e la sottomissione risulta fallita — mai stato senza traccia.
 */

import { TechnologyRequest, RequestStatus } from '@/types';
import { dataverseClient } from './dataverseClient';
import { eseguiTriage, TriageResult } from './triage';
import { validaDGR306_2024, validaCoerenzaRichiesta, validaBudget } from './validations';

/**
 * Flag di attivazione della persistenza reale su Dataverse.
 * Va abilitato esplicitamente (NEXT_PUBLIC_ENABLE_PERSISTENCE=true) una volta
 * create le tabelle: con flag spento i form mantengono il comportamento
 * dimostrativo precedente (nessuna scrittura).
 */
export const PERSISTENCE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PERSISTENCE === 'true';

export interface SubmitResult {
  id: string;
  triage: TriageResult;
  warnings: string[];
}

/**
 * Valida, esegue il triage e persiste una nuova richiesta.
 * Lancia Error con messaggio leggibile se la richiesta è invalida
 * (es. violazioni DGR 306/2024) o se la persistenza/audit falliscono.
 */
export async function submitTechnologyRequest(
  dati: Partial<TechnologyRequest>
): Promise<SubmitResult> {
  const warnings: string[] = [];

  // --- Validazioni bloccanti -------------------------------------------
  if (dati.isDonazione && dati.donazione) {
    const esito = validaDGR306_2024(dati.donazione);
    if (!esito.isValid) {
      throw new Error(`Richiesta non valida:\n${esito.errors.join('\n')}`);
    }
    warnings.push(...esito.warnings);
  }

  if (dati.budget) {
    const esitoBudget = validaBudget(dati.budget);
    if (!esitoBudget.isValid) {
      throw new Error(`Budget non valido:\n${esitoBudget.errors.join('\n')}`);
    }
    warnings.push(...esitoBudget.warnings);

    const esitoCoerenza = validaCoerenzaRichiesta({
      isDonazione: dati.isDonazione || false,
      donazione: dati.donazione,
      richiedeService: dati.richiedeService || false,
      service: dati.service,
      richiedeConsumabili: dati.richiedeConsumabili || false,
      consumabili: dati.consumabili,
      budget: dati.budget,
    });
    if (!esitoCoerenza.isValid) {
      throw new Error(`Richiesta non coerente:\n${esitoCoerenza.errors.join('\n')}`);
    }
    warnings.push(...esitoCoerenza.warnings);
  }

  // --- Triage automatico ------------------------------------------------
  const triage = eseguiTriage(dati);
  warnings.push(...(triage.warning ?? []));

  // --- Utente corrente --------------------------------------------------
  const user = await dataverseClient.getCurrentUser();
  if (!user) {
    throw new Error('Utente non autenticato o non registrato: effettuare il login.');
  }

  // --- Persistenza ------------------------------------------------------
  const record: Partial<TechnologyRequest> = {
    ...dati,
    statoCorrente: RequestStatus.SOTTOMESSA,
    trackAssegnato: triage.trackAssegnato,
    dataAssegnazioneTrack: new Date(),
    motivazioneAssegnazioneTrack: `${triage.criterioApplicato} — ${triage.motivazione}`,
    richiedenteId: user.id,
  };

  const id = await dataverseClient.createRequest(record);

  // --- Audit trail obbligatorio ----------------------------------------
  try {
    await dataverseClient.addWorkflowHistory(
      id,
      user.id,
      'Richiesta sottomessa',
      undefined,
      RequestStatus.SOTTOMESSA,
      `Triage automatico: ${triage.criterioApplicato} — ${triage.motivazione}`
    );
  } catch (err) {
    // Compensazione: nessuna richiesta deve esistere senza voce di audit
    try {
      await dataverseClient.deleteRequest(id);
    } catch {
      // se anche la cancellazione fallisce, l'errore sotto segnala l'id orfano
    }
    const dettaglio = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Sottomissione annullata: impossibile scrivere l'audit trail (richiesta ${id}). ${dettaglio}`
    );
  }

  return { id, triage, warnings };
}

/**
 * Carica le richieste da Dataverse per la Dashboard/RequestManager.
 */
export async function loadRequests(): Promise<TechnologyRequest[]> {
  return dataverseClient.getRequests();
}
