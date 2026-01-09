/**
 * WORKFLOW MANAGER - Gestione stati e transizioni
 */

import {
  TechnologyRequest,
  RequestStatus,
  TrackType,
  UserRole,
  HistoryEntry,
  User
} from '@/types';

export interface WorkflowTransition {
  fromStatus: RequestStatus;
  toStatus: RequestStatus;
  requiredRole: UserRole[];
  validationFunction?: (request: TechnologyRequest) => boolean;
  description: string;
}

/**
 * Definizione transizioni workflow per ogni track
 */
export const WORKFLOW_TRANSITIONS: Record<TrackType, WorkflowTransition[]> = {
  // TRACK 1: URGENZA CRITICA (24-48h)
  [TrackType.URGENZA_CRITICA]: [
    {
      fromStatus: RequestStatus.SOTTOMESSA,
      toStatus: RequestStatus.IN_TRIAGE,
      requiredRole: [UserRole.COORDINATORE_COMMAZ],
      description: 'Coordinatore CommAz riceve richiesta urgente'
    },
    {
      fromStatus: RequestStatus.IN_TRIAGE,
      toStatus: RequestStatus.ASSEGNATO_TRACK,
      requiredRole: [UserRole.COORDINATORE_COMMAZ, UserRole.DIREZIONE_SANITARIA],
      description: 'Verifica criterio urgenza (max 4h)'
    },
    {
      fromStatus: RequestStatus.ASSEGNATO_TRACK,
      toStatus: RequestStatus.IN_APPROVAZIONE_DA,
      requiredRole: [UserRole.DIREZIONE_AMMINISTRATIVA],
      description: 'Decisione DA finale (entro 24h)'
    },
    {
      fromStatus: RequestStatus.IN_APPROVAZIONE_DA,
      toStatus: RequestStatus.APPROVATA,
      requiredRole: [UserRole.DIREZIONE_AMMINISTRATIVA],
      description: 'Approvazione urgenza critica'
    }
  ],

  // TRACK 2: FAST TRACK (5-7 giorni)
  [TrackType.FAST_TRACK]: [
    {
      fromStatus: RequestStatus.SOTTOMESSA,
      toStatus: RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO,
      requiredRole: [UserRole.DIRETTORE_DIPARTIMENTO, UserRole.RESPONSABILE_ZONA_DISTRETTO],
      description: 'Validazione Direttore Dipartimento (2 gg)'
    },
    {
      fromStatus: RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO,
      toStatus: RequestStatus.IN_PRESCREENING,
      requiredRole: [UserRole.COORDINATORE_COMMAZ],
      description: 'Pre-screening CoordCommAz (3 gg)'
    },
    {
      fromStatus: RequestStatus.IN_PRESCREENING,
      toStatus: RequestStatus.IN_APPROVAZIONE_DA,
      requiredRole: [UserRole.DIREZIONE_SANITARIA, UserRole.DIREZIONE_AMMINISTRATIVA],
      description: 'Approvazione DS/DA (2 gg)'
    },
    {
      fromStatus: RequestStatus.IN_APPROVAZIONE_DA,
      toStatus: RequestStatus.APPROVATA,
      requiredRole: [UserRole.DIREZIONE_AMMINISTRATIVA],
      description: 'Decisione finale DA'
    }
  ],

  // TRACK 3: PROCEDURA SEMPLIFICATA (15-20 giorni)
  [TrackType.SEMPLIFICATA]: [
    {
      fromStatus: RequestStatus.SOTTOMESSA,
      toStatus: RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO,
      requiredRole: [UserRole.DIRETTORE_DIPARTIMENTO],
      description: 'Validazione Dipartimento + Pre-screening (5 gg)'
    },
    {
      fromStatus: RequestStatus.IN_VALIDAZIONE_DIPARTIMENTO,
      toStatus: RequestStatus.IN_PRESCREENING,
      requiredRole: [UserRole.COORDINATORE_COMMAZ],
      description: 'Valutazione tecnico-economica CoordCommAz'
    },
    {
      fromStatus: RequestStatus.IN_PRESCREENING,
      toStatus: RequestStatus.IN_VALUTAZIONE_COMMAZ,
      requiredRole: [UserRole.COORDINATORE_COMMAZ, UserRole.MEMBRO_COMMAZ],
      description: 'CommAz ristretta - solo membri core (7 gg)'
    },
    {
      fromStatus: RequestStatus.IN_VALUTAZIONE_COMMAZ,
      toStatus: RequestStatus.IN_APPROVAZIONE_DA,
      requiredRole: [UserRole.DIREZIONE_SANITARIA, UserRole.DIREZIONE_AMMINISTRATIVA],
      description: 'Approvazione DS/DA (3 gg)'
    },
    {
      fromStatus: RequestStatus.IN_APPROVAZIONE_DA,
      toStatus: RequestStatus.APPROVATA,
      requiredRole: [UserRole.DIREZIONE_AMMINISTRATIVA],
      description: 'Decisione finale DA'
    }
  ],

  // TRACK 4: HTA COMPLETO (30-45 giorni)
  [TrackType.HTA_COMPLETO]: [
    {
      fromStatus: RequestStatus.SOTTOMESSA,
      toStatus: RequestStatus.IN_PRESCREENING,
      requiredRole: [UserRole.COORDINATORE_COMMAZ],
      description: 'Istruttoria approfondita CoordCommAz'
    },
    {
      fromStatus: RequestStatus.IN_PRESCREENING,
      toStatus: RequestStatus.IN_VALUTAZIONE_COMMAZ,
      requiredRole: [UserRole.COORDINATORE_COMMAZ, UserRole.MEMBRO_COMMAZ],
      description: 'CommAz completa con audizioni e MCDA'
    },
    {
      fromStatus: RequestStatus.IN_VALUTAZIONE_COMMAZ,
      toStatus: RequestStatus.IN_APPROVAZIONE_DS,
      requiredRole: [UserRole.DIREZIONE_SANITARIA],
      description: 'Ratifica parere tecnico DS'
    },
    {
      fromStatus: RequestStatus.IN_APPROVAZIONE_DS,
      toStatus: RequestStatus.IN_APPROVAZIONE_DA,
      requiredRole: [UserRole.DIREZIONE_AMMINISTRATIVA],
      description: 'Autorizzazione finale DA'
    },
    {
      fromStatus: RequestStatus.IN_APPROVAZIONE_DA,
      toStatus: RequestStatus.APPROVATA,
      requiredRole: [UserRole.DIREZIONE_AMMINISTRATIVA],
      description: 'Decisione finale e comunicazione'
    }
  ]
};

/**
 * Verifica se un utente può eseguire una transizione
 */
export function canExecuteTransition(
  user: User,
  request: TechnologyRequest,
  toStatus: RequestStatus
): boolean {
  if (!request.trackAssegnato) return false;

  const transitions = WORKFLOW_TRANSITIONS[request.trackAssegnato];
  const transition = transitions.find(
    t => t.fromStatus === request.statoCorrente && t.toStatus === toStatus
  );

  if (!transition) return false;

  // Verifica ruolo utente
  const hasRole = transition.requiredRole.includes(user.ruolo);
  if (!hasRole) return false;

  // Esegui validazione custom se presente
  if (transition.validationFunction) {
    return transition.validationFunction(request);
  }

  return true;
}

/**
 * Esegue una transizione di stato
 */
export function executeTransition(
  request: TechnologyRequest,
  user: User,
  toStatus: RequestStatus,
  note?: string
): TechnologyRequest {
  if (!canExecuteTransition(user, request, toStatus)) {
    throw new Error('Transizione non autorizzata');
  }

  const historyEntry: HistoryEntry = {
    id: generateId(),
    data: new Date(),
    utenteId: user.id,
    utente: user,
    azione: `Transizione: ${request.statoCorrente} → ${toStatus}`,
    statoPrec: request.statoCorrente,
    statoNuovo: toStatus,
    note
  };

  return {
    ...request,
    statoCorrente: toStatus,
    dataUltimaModifica: new Date(),
    storico: [...request.storico, historyEntry]
  };
}

/**
 * Ottieni prossimi stati possibili per una richiesta
 */
export function getNextStatuses(request: TechnologyRequest, user: User): {
  status: RequestStatus;
  description: string;
  canExecute: boolean;
}[] {
  if (!request.trackAssegnato) return [];

  const transitions = WORKFLOW_TRANSITIONS[request.trackAssegnato];

  return transitions
    .filter(t => t.fromStatus === request.statoCorrente)
    .map(t => ({
      status: t.toStatus,
      description: t.description,
      canExecute: canExecuteTransition(user, request, t.toStatus)
    }));
}

/**
 * Approva richiesta (cambio stato specifico per approvazioni)
 */
export function approveRequest(
  request: TechnologyRequest,
  user: User,
  note?: string
): TechnologyRequest {
  let nextStatus: RequestStatus;

  switch (request.statoCorrente) {
    case RequestStatus.IN_APPROVAZIONE_DA:
      nextStatus = RequestStatus.APPROVATA;
      break;
    case RequestStatus.IN_APPROVAZIONE_DS:
      nextStatus = RequestStatus.IN_APPROVAZIONE_DA;
      break;
    case RequestStatus.IN_VALUTAZIONE_COMMAZ:
      nextStatus = RequestStatus.IN_APPROVAZIONE_DS;
      break;
    default:
      throw new Error('Stato non valido per approvazione');
  }

  return executeTransition(request, user, nextStatus, note);
}

/**
 * Respingi richiesta
 */
export function rejectRequest(
  request: TechnologyRequest,
  user: User,
  motivazione: string
): TechnologyRequest {
  const historyEntry: HistoryEntry = {
    id: generateId(),
    data: new Date(),
    utenteId: user.id,
    utente: user,
    azione: 'Richiesta respinta',
    statoPrec: request.statoCorrente,
    statoNuovo: RequestStatus.RESPINTA,
    note: motivazione
  };

  return {
    ...request,
    statoCorrente: RequestStatus.RESPINTA,
    esitoFinale: 'RESPINTO',
    motivazioneEsitoFinale: motivazione,
    dataUltimaModifica: new Date(),
    storico: [...request.storico, historyEntry]
  };
}

/**
 * Rinvia richiesta per integrazioni
 */
export function returnRequest(
  request: TechnologyRequest,
  user: User,
  motivazione: string
): TechnologyRequest {
  const historyEntry: HistoryEntry = {
    id: generateId(),
    data: new Date(),
    utenteId: user.id,
    utente: user,
    azione: 'Richiesta rinviata per integrazioni',
    statoPrec: request.statoCorrente,
    statoNuovo: RequestStatus.RINVIATA,
    note: motivazione
  };

  return {
    ...request,
    statoCorrente: RequestStatus.RINVIATA,
    dataUltimaModifica: new Date(),
    storico: [...request.storico, historyEntry]
  };
}

/**
 * Calcola statistiche workflow
 */
export function calculateWorkflowStats(requests: TechnologyRequest[]): {
  avgDaysPerTrack: Record<TrackType, number>;
  avgDaysPerStatus: Record<RequestStatus, number>;
  bottlenecks: { status: RequestStatus; avgDays: number }[];
} {
  const daysByTrack: Record<TrackType, number[]> = {
    [TrackType.URGENZA_CRITICA]: [],
    [TrackType.FAST_TRACK]: [],
    [TrackType.SEMPLIFICATA]: [],
    [TrackType.HTA_COMPLETO]: []
  };

  const daysByStatus: Partial<Record<RequestStatus, number[]>> = {};

  requests.forEach(req => {
    if (req.trackAssegnato && req.dataAssegnazioneTrack) {
      const giorni = Math.floor(
        (new Date().getTime() - new Date(req.dataAssegnazioneTrack).getTime()) /
        (1000 * 60 * 60 * 24)
      );
      daysByTrack[req.trackAssegnato].push(giorni);
    }

    // Calcola tempo medio per stato
    const statusDays = calculateDaysInStatus(req);
    Object.entries(statusDays).forEach(([status, days]) => {
      if (!daysByStatus[status as RequestStatus]) {
        daysByStatus[status as RequestStatus] = [];
      }
      daysByStatus[status as RequestStatus]!.push(days);
    });
  });

  const avgDaysPerTrack = Object.entries(daysByTrack).reduce(
    (acc, [track, days]) => ({
      ...acc,
      [track]: days.length > 0 ? days.reduce((a, b) => a + b, 0) / days.length : 0
    }),
    {} as Record<TrackType, number>
  );

  const avgDaysPerStatus = Object.entries(daysByStatus).reduce(
    (acc, [status, days]) => ({
      ...acc,
      [status]: days!.length > 0 ? days!.reduce((a, b) => a + b, 0) / days!.length : 0
    }),
    {} as Record<RequestStatus, number>
  );

  // Identifica bottleneck (stati con tempo medio alto)
  const bottlenecks = Object.entries(avgDaysPerStatus)
    .map(([status, avgDays]) => ({
      status: status as RequestStatus,
      avgDays
    }))
    .filter(b => b.avgDays > 5)
    .sort((a, b) => b.avgDays - a.avgDays);

  return {
    avgDaysPerTrack,
    avgDaysPerStatus,
    bottlenecks
  };
}

/**
 * Calcola giorni trascorsi in ciascuno stato
 */
function calculateDaysInStatus(request: TechnologyRequest): Record<string, number> {
  const result: Record<string, number> = {};

  for (let i = 0; i < request.storico.length; i++) {
    const current = request.storico[i];
    const next = request.storico[i + 1];

    if (current.statoNuovo) {
      const startDate = new Date(current.data);
      const endDate = next ? new Date(next.data) : new Date();
      const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      result[current.statoNuovo] = days;
    }
  }

  return result;
}

/**
 * Genera ID univoco
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
