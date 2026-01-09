/**
 * TIPI E MODELLI DATI
 * Gestionale Richieste Tecnologie Sanitarie
 * Integra: Procedura TS + Sistema Multi-Track + Service/Consumabili
 */

// ============================================================================
// ENUMS E COSTANTI
// ============================================================================

/**
 * Sistema Multi-Track - 4 livelli di urgenza e complessità
 */
export enum TrackType {
  URGENZA_CRITICA = 'TRACK_1',      // 24-48h
  FAST_TRACK = 'TRACK_2',            // 5-7 giorni
  SEMPLIFICATA = 'TRACK_3',          // 15-20 giorni
  HTA_COMPLETO = 'TRACK_4'           // 30-45 giorni
}

/**
 * Stati workflow richiesta
 */
export enum RequestStatus {
  BOZZA = 'BOZZA',
  SOTTOMESSA = 'SOTTOMESSA',
  IN_TRIAGE = 'IN_TRIAGE',
  ASSEGNATO_TRACK = 'ASSEGNATO_TRACK',
  IN_VALIDAZIONE_DIPARTIMENTO = 'IN_VALIDAZIONE_DIPARTIMENTO',
  IN_PRESCREENING = 'IN_PRESCREENING',
  IN_VALUTAZIONE_COMMAZ = 'IN_VALUTAZIONE_COMMAZ',
  IN_APPROVAZIONE_DS = 'IN_APPROVAZIONE_DS',
  IN_APPROVAZIONE_DA = 'IN_APPROVAZIONE_DA',
  APPROVATA = 'APPROVATA',
  RESPINTA = 'RESPINTA',
  RINVIATA = 'RINVIATA',
  IN_ACQUISIZIONE_ESTAR = 'IN_ACQUISIZIONE_ESTAR',
  COMPLETATA = 'COMPLETATA'
}

/**
 * Ruoli utenti sistema
 */
export enum UserRole {
  RESPONSABILE_UO = 'RESPONSABILE_UO',
  DIRETTORE_UOC = 'DIRETTORE_UOC',
  DIRETTORE_DIPARTIMENTO = 'DIRETTORE_DIPARTIMENTO',
  RESPONSABILE_ZONA_DISTRETTO = 'RESPONSABILE_ZONA_DISTRETTO',
  COORDINATORE_COMMAZ = 'COORDINATORE_COMMAZ',
  MEMBRO_COMMAZ = 'MEMBRO_COMMAZ',
  USL_TS = 'USL_TS',
  USL_PM = 'USL_PM',
  ESTAR_TS = 'ESTAR_TS',
  DIREZIONE_SANITARIA = 'DIREZIONE_SANITARIA',
  DIREZIONE_AMMINISTRATIVA = 'DIREZIONE_AMMINISTRATIVA',
  ADMIN = 'ADMIN'
}

/**
 * Tipo di acquisto
 */
export enum AcquisitionType {
  PROGRAMMATO = 'PROGRAMMATO',
  NON_PROGRAMMATO = 'NON_PROGRAMMATO',
  SOSTITUZIONE = 'SOSTITUZIONE',
  DONAZIONE = 'DONAZIONE',
  COMODATO = 'COMODATO',
  NOLEGGIO = 'NOLEGGIO'
}

/**
 * Tipologia apparecchiatura
 */
export enum EquipmentType {
  GENERALE = 'GENERALE',
  ECOGRAFO = 'ECOGRAFO',
  DIAGNOSTICA = 'DIAGNOSTICA',
  LABORATORIO = 'LABORATORIO',
  TERAPIA = 'TERAPIA',
  RIABILITAZIONE = 'RIABILITAZIONE',
  ALTRO = 'ALTRO'
}

/**
 * Priorità richiesta (per Track 2 Fast Track)
 */
export enum Priority {
  A = 'A',  // Massima urgenza
  B = 'B',  // Alta
  C = 'C'   // Media
}

// ============================================================================
// INTERFACCE DATI
// ============================================================================

/**
 * Utente del sistema
 */
export interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
  unitaOperativa?: string;
  dipartimento?: string;
  zonaDistretto?: string;
  telefono?: string;
  attivo: boolean;
  dataCreazione: Date;
}

/**
 * Configurazione Track con tempi e criteri
 */
export interface TrackConfig {
  type: TrackType;
  nome: string;
  tempoMassimoGiorni: number;
  colore: string;
  descrizione: string;
  criteri: string[];
}

/**
 * Service - Contratto service apparecchiatura
 */
export interface ServiceContract {
  serviceGiaAggiudicatoESTAR: boolean;
  numeroDeliberaESTAR?: string;
  dataDeliberaESTAR?: Date;
  fornitore: string;
  durataContrattualeAnni: number;
  dataInizio?: Date;
  dataFine?: Date;
  canoneAnnuo: number;  // IVA esclusa
  valoreTotaleContratto: number;

  // Consumabili inclusi nel service
  consumabiliInclusi: 'DEDICATI' | 'GENERICI' | 'NESSUNO';

  // Penali uscita
  penaliUscitaAnticipata: boolean;
  percentualePenale?: number;

  // Tipo richiesta service
  tipoRichiestaService: 'RINNOVO' | 'ESTENSIONE' | 'NUOVO';

  // Validazioni automatiche
  flagPassaHTACompleto?: boolean;  // Calcolato automaticamente
  motivazioneHTACompleto?: string;
}

/**
 * Consumabili
 */
export interface Consumables {
  consumabiliGiaGaraESTAR: boolean;
  numeroDeliberaESTAR?: string;
  dataDeliberaESTAR?: Date;
  tipologia: string;
  fornitore: string;
  consumoAnnuoStimato: number;

  // Tipo consumabile (criticità vendor lock-in)
  tipoConsumabile: 'DEDICATI' | 'GENERICI';

  // Motivazione richiesta
  motivazioneRichiesta: 'INCREMENTO_VOLUMI' | 'NUOVA_TECNOLOGIA' | 'RIORDINO_URGENTE' | 'ALTRO';
  percentualeIncremento?: number;
  altroMotivo?: string;

  // Alternative mercato
  esistonoAlternative: boolean;
  noteAlternative?: string;

  // Validazioni automatiche
  flagPassaHTACompleto?: boolean;
  motivazioneHTACompleto?: string;
}

/**
 * Budget e copertura finanziaria
 */
export interface BudgetCoverage {
  valoreStimatoEuro: number;
  ivaEsclusa: boolean;
  fonteFinanziamento: 'PIANO_INVESTIMENTI' | 'FONDO_INDISTINTO' | 'FONDI_STATALI' | 'DONAZIONE' | 'ALTRO';
  dettaglioFonte?: string;

  // Riferimenti
  annoRiferimento: number;
  capitoloBilancio?: string;

  // Autorizzazioni
  budgetDisponibile: boolean;
  importoDisponibile?: number;
  richiestaIntegrazione: boolean;
  importoIntegrazione?: number;

  // Validazione USL PM
  validatoUSLPM: boolean;
  dataValidazioneUSLPM?: Date;
  noteUSLPM?: string;
}

/**
 * Donazione
 */
export interface Donation {
  donatoreIdentificato: boolean;
  nomeDonatore?: string;
  valoreDonazione: number;

  // Vincoli DGR 306/2024
  materialiUsoDecicati: boolean;
  conformeDGR306: boolean;

  // Tecnologia
  tecnologiaGiaAggiudicata: boolean;
  tecnologiaConosciuta: boolean;

  // Validazioni
  eligibileProceduraSemplificata: boolean;  // <50K, no consumabili dedicati
  motivazioneHTACompleto?: string;
}

/**
 * Richiesta principale - modello completo
 */
export interface TechnologyRequest {
  // Identificazione
  id: string;
  numeroProgressivo: string;  // ES: 2025-001
  dataCreazione: Date;
  dataUltimaModifica: Date;

  // Tracking workflow
  statoCorrente: RequestStatus;
  trackAssegnato?: TrackType;
  dataAssegnazioneTrack?: Date;
  giorniTrascorsi: number;
  giorniResiduiTrack?: number;

  // Richiedenti e struttura
  richiedenteId: string;  // ID utente
  richiedente: User;
  unitaOperativa: string;
  dipartimento: string;
  zonaDistretto?: string;

  // Direttore validante
  direttoreDipartimentoId?: string;
  direttoreDipartimento?: User;
  dataValidazioneDipartimento?: Date;
  noteDirettoreDipartimento?: string;

  // Tipo e caratteristiche richiesta
  tipoAcquisto: AcquisitionType;
  tipoApparecchiatura: EquipmentType;
  priorita?: Priority;  // Solo per Fast Track

  // Descrizione apparecchiatura
  nomeApparecchiatura: string;
  descrizioneDettagliata: string;
  caratteristicheTecniche: string;

  // Motivazione clinica/organizzativa
  motivazioneRichiesta: string;
  impattoAssistenziale: string;
  esistonoAlternative: boolean;
  descrizioneAlternative?: string;

  // Sostituzione (se applicabile)
  isSostituzione: boolean;
  apparecchiaturaSOStituita?: string;
  motivoSostituzione?: 'NON_RIPARABILE' | 'OBSOLETO' | 'UPGRADE_OBBLIGATO' | 'ALTRO';
  dettaglioMotivoSostituzione?: string;

  // Budget
  budget: BudgetCoverage;

  // Service (opzionale)
  richiedeService: boolean;
  service?: ServiceContract;

  // Consumabili (opzionale)
  richiedeConsumabili: boolean;
  consumabili?: Consumables;

  // Donazione (opzionale)
  isDonazione: boolean;
  donazione?: Donation;

  // Requisiti strutturali
  richiedeAdeguamentiStrutturali: boolean;
  descrizioneAdeguamenti?: string;
  studioFattibilitaRichiesto: boolean;
  studioFattibilitaCompletato?: boolean;

  // Triage Coordinatore CommAz
  dataTriageCoordCommAz?: Date;
  coordinatoreCommAzId?: string;
  coordinatoreCommAz?: User;
  noteTriageCoordCommAz?: string;
  motivazioneAssegnazioneTrack?: string;

  // Pre-screening tecnico-economico (Coord CommAz)
  dataPrescreening?: Date;
  esitoPrescreening?: 'APPROVATO' | 'RESPINTO' | 'RICHIEDE_INTEGRAZIONE';
  notePrescreening?: string;

  // Valutazione CommAz (Track 3 e 4)
  dataConvocazioneCommAz?: Date;
  verbaleCommAzId?: string;
  esitoCommAz?: 'FAVOREVOLE' | 'CONTRARIO' | 'FAVOREVOLE_CON_PRESCRIZIONI';
  noteCommAz?: string;

  // HTA Regionale (se classe IIb/III innovativo)
  richiedeHTARegionale: boolean;
  dataInvioHTARegionale?: Date;
  esitoHTARegionale?: string;

  // Approvazione DS
  dataApprovazioneDS?: Date;
  direzioneSanitariaId?: string;
  direzioneSanitaria?: User;
  esitoDS?: 'APPROVATO' | 'RESPINTO' | 'RINVIATO';
  noteDS?: string;

  // Approvazione finale DA
  dataApprovazioneDA?: Date;
  direzioneAmministrativaId?: string;
  direzioneAmministrativa?: User;
  esitoFinale?: 'APPROVATO' | 'RESPINTO' | 'RINVIATO';
  noteDA?: string;
  motivazioneEsitoFinale?: string;

  // Invio ESTAR
  dataInvioESTAR?: Date;
  numeroRichiestaESTAR?: string;

  // Allegati e documentazione
  allegati: Attachment[];

  // Audit trail
  storico: HistoryEntry[];

  // Metadata
  tags?: string[];
  notePubbliche?: string;
  notePrivate?: string;
}

/**
 * Allegato
 */
export interface Attachment {
  id: string;
  nome: string;
  tipo: string;
  dimensione: number;
  url: string;
  dataCaricamento: Date;
  caricatoDa: string;
}

/**
 * Entry storico modifiche
 */
export interface HistoryEntry {
  id: string;
  data: Date;
  utenteId: string;
  utente: User;
  azione: string;
  statoPrec?: RequestStatus;
  statoNuovo?: RequestStatus;
  note?: string;
  campiModificati?: string[];
}

/**
 * Report trimestrale
 */
export interface QuarterlyReport {
  id: string;
  anno: number;
  trimestre: 1 | 2 | 3 | 4;
  dataGenerazione: Date;
  generatoDa: User;

  // Statistiche per track
  volumiPerTrack: {
    track: TrackType;
    totaleRichieste: number;
    approvate: number;
    respinte: number;
    rinviate: number;
    tempoMedioGiorni: number;
  }[];

  // Analisi complessiva
  totaleRichieste: number;
  totaleApprovate: number;
  totaleRespinte: number;
  totaleRinviate: number;

  // Budget
  budgetTotaleRichiesto: number;
  budgetTotaleApprovato: number;

  // Colli di bottiglia identificati
  colliBottiglia: {
    fase: string;
    descrizione: string;
    tempoMedioGiorni: number;
    suggerimenti: string;
  }[];

  // Raccomandazioni
  raccomandazioni: string[];

  // File report
  fileReportPDF?: string;
}

/**
 * Dashboard stats
 */
export interface DashboardStats {
  richiesteInCorso: number;
  richiesteCompletateUltimoMese: number;
  tempoMedioApprovazione: number;

  richiestePerTrack: {
    track: TrackType;
    count: number;
  }[];

  richiestePerStato: {
    stato: RequestStatus;
    count: number;
  }[];

  alertTempiScadenza: TechnologyRequest[];  // Richieste in ritardo

  budgetUtilizzato: number;
  budgetDisponibile: number;
}

// ============================================================================
// CONFIGURAZIONI TRACK
// ============================================================================

export const TRACK_CONFIGS: Record<TrackType, TrackConfig> = {
  [TrackType.URGENZA_CRITICA]: {
    type: TrackType.URGENZA_CRITICA,
    nome: 'Urgenza Critica',
    tempoMassimoGiorni: 2,
    colore: '#dc2626',
    descrizione: '24-48h per urgenze critiche safety',
    criteri: [
      'Safety critica con rischio immediato pazienti',
      'Blocco servizio essenziale senza alternative',
      'Obbligo normativo urgente'
    ]
  },
  [TrackType.FAST_TRACK]: {
    type: TrackType.FAST_TRACK,
    nome: 'Fast Track',
    tempoMassimoGiorni: 7,
    colore: '#f59e0b',
    descrizione: '5-7 giorni per sostituzioni e urgenze operative',
    criteri: [
      'Sostituzioni 1:1 già aggiudicate',
      'Urgenze operative con workaround',
      'Service/consumabili ESTAR',
      'Sotto soglia €15.000'
    ]
  },
  [TrackType.SEMPLIFICATA]: {
    type: TrackType.SEMPLIFICATA,
    nome: 'Procedura Semplificata',
    tempoMassimoGiorni: 20,
    colore: '#3b82f6',
    descrizione: '15-20 giorni per donazioni e ampliamenti',
    criteri: [
      'Donazioni <€50K senza consumabili dedicati',
      'Ampliamenti dotazione',
      'Upgrade programmabili'
    ]
  },
  [TrackType.HTA_COMPLETO]: {
    type: TrackType.HTA_COMPLETO,
    nome: 'HTA Completo',
    tempoMassimoGiorni: 45,
    colore: '#8b5cf6',
    descrizione: '30-45 giorni per nuove tecnologie e alto impatto',
    criteri: [
      'Nuove tecnologie non aggiudicate',
      'Alto impatto organizzativo',
      'Donazioni >€50K',
      'Consumabili dedicati',
      'Innovativi classe IIb/III'
    ]
  }
};
