/**
 * TRANSIZIONI DI STATO LATO SERVER (BFF)
 *
 * Enforcement dei ruoli sul server (il ruolo arriva da ts_utentis, non dal
 * client) e audit trail obbligatorio con compensazione: se la voce di
 * workflow history non si scrive, lo stato viene riportato al precedente.
 * Timestamp generati qui, non sul browser dell'utente.
 */

import { RequestStatus, User } from '@/types';
import type { DataverseClient } from '@/lib/dataverseClient';
import { canExecuteTransition } from '@/lib/workflow';

export class TransitionError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'TransitionError';
  }
}

export interface TransitionResult {
  id: string;
  from: RequestStatus;
  to: RequestStatus;
}

export async function executeServerTransition(
  client: DataverseClient,
  user: User,
  richiestaId: string,
  toStatus: RequestStatus,
  note?: string
): Promise<TransitionResult> {
  const richiesta = await client.getRequestById(richiestaId);
  if (!richiesta) {
    throw new TransitionError('Richiesta non trovata', 404);
  }

  // Enforcement ruoli/percorso: la matrice WORKFLOW_TRANSITIONS è la stessa
  // del client, ma qui il ruolo proviene da ts_utentis
  if (!canExecuteTransition(user, richiesta, toStatus)) {
    throw new TransitionError(
      `Transizione ${richiesta.statoCorrente} → ${toStatus} non autorizzata per il ruolo ${user.ruolo}`,
      403
    );
  }

  const from = richiesta.statoCorrente;

  // 1) applica lo stato
  await client.updateRequest(richiestaId, { statoCorrente: toStatus });

  // 2) audit obbligatorio; in caso di errore compensa riportando lo stato
  try {
    await client.addWorkflowHistory(
      richiestaId,
      user.id,
      `Transizione: ${from} → ${toStatus}`,
      from,
      toStatus,
      note
    );
  } catch (err) {
    try {
      await client.updateRequest(richiestaId, { statoCorrente: from });
    } catch {
      // compensazione fallita: lo segnala l'errore sottostante
    }
    const dettaglio = err instanceof Error ? err.message : String(err);
    throw new TransitionError(
      `Transizione annullata: impossibile scrivere l'audit trail. ${dettaglio}`,
      502
    );
  }

  return { id: richiestaId, from, to: toStatus };
}
