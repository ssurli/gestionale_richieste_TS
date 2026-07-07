/**
 * MAPPER FORM → TechnologyRequest
 *
 * Converte i dati dei 4 moduli (MOD.01, MOD.02, Fast Track, Semplificato)
 * nel modello di dominio Partial<TechnologyRequest> per triage e persistenza.
 * Funzioni pure e testabili: nessun accesso a rete o stato.
 *
 * NB: i moduli cartacei hanno campi che non esistono (ancora) nel modello
 * Dataverse: quelli vengono accodati alla descrizione per non perderli.
 */

import {
  TechnologyRequest,
  AcquisitionType,
  EquipmentType,
  BudgetCoverage,
} from '@/types';
import { parseItalianNumber } from './numberFormat';

// ---------------------------------------------------------------------------
// Helper comuni
// ---------------------------------------------------------------------------

/**
 * Mappa il testo libero della fonte di finanziamento sull'option set
 * Dataverse; il testo originale è conservato in dettaglioFonte.
 */
export function mapFonteFinanziamento(
  testo: string | undefined,
  fallback: BudgetCoverage['fonteFinanziamento'] = 'ALTRO'
): Pick<BudgetCoverage, 'fonteFinanziamento' | 'dettaglioFonte'> {
  const t = (testo || '').toLowerCase();
  if (t.includes('piano')) return { fonteFinanziamento: 'PIANO_INVESTIMENTI', dettaglioFonte: testo };
  if (t.includes('donaz')) return { fonteFinanziamento: 'DONAZIONE', dettaglioFonte: testo };
  if (t.includes('statal')) return { fonteFinanziamento: 'FONDI_STATALI', dettaglioFonte: testo };
  if (t.includes('indistint')) return { fonteFinanziamento: 'FONDO_INDISTINTO', dettaglioFonte: testo };
  return { fonteFinanziamento: fallback, dettaglioFonte: testo || 'Non specificato nel modulo' };
}

function budgetBase(
  importo: string,
  fonteTesto?: string,
  fallback: BudgetCoverage['fonteFinanziamento'] = 'ALTRO'
): BudgetCoverage {
  return {
    valoreStimatoEuro: parseItalianNumber(importo),
    ivaEsclusa: true,
    ...mapFonteFinanziamento(fonteTesto, fallback),
    annoRiferimento: new Date().getFullYear(),
    budgetDisponibile: true,
    richiestaIntegrazione: false,
    validatoUSLPM: false,
  };
}

function righeNonVuote(righe: Array<[string, string | undefined]>): string {
  return righe
    .filter(([, v]) => v && v.trim() !== '')
    .map(([label, v]) => `${label}: ${v}`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// MOD.01 — Richiesta attrezzature sanitarie (escluse ecografiche)
// ---------------------------------------------------------------------------

export interface Mod01Input {
  richiedente: string;
  telefono: string;
  email: string;
  repartoDestinatario: string;
  presidioUtilizzo: string;
  descrizione: string;
  quantita: string;
  caratteristicheTecniche: string;
  proceduraDiagnosi: string;
  comeVienesvoltaAttualmente: string;
  motivoAcquisizione: 'incremento' | 'sostituzione' | 'aggiornamento' | '';
  codFuoriUso: string;
  tecnologieStessaTipologia: 'si' | 'no' | '';
  specificareTecnologie: string;
  miglioramentiAttesi: string;
  tipoContratto: 'acquisto' | 'leasing' | 'service' | 'noleggio' | '';
  costoAcquisto: string;
  costoNoleggioServiceLeasing: string;
  costoConsumabili: string;
  progettoFinalizzato: 'si' | 'no' | '';
  codProgetto: string;
  note: string;
}

export function mapMod01ToRequest(f: Mod01Input): Partial<TechnologyRequest> {
  const isSostituzione = f.motivoAcquisizione === 'sostituzione';
  const importo = f.tipoContratto === 'acquisto' || f.costoAcquisto
    ? f.costoAcquisto
    : f.costoNoleggioServiceLeasing;

  const extra = righeNonVuote([
    ['Quantità', f.quantita],
    ['Procedura/diagnosi', f.proceduraDiagnosi],
    ['Come svolta attualmente', f.comeVienesvoltaAttualmente],
    ['Tipo contratto', f.tipoContratto],
    ['Costo consumabili stimato', f.costoConsumabili],
    ['Progetto finalizzato', f.progettoFinalizzato === 'si' ? f.codProgetto || 'sì' : ''],
    ['Note', f.note],
    ['Modulo di origine', 'MOD.01_TS'],
  ]);

  return {
    tipoAcquisto: isSostituzione ? AcquisitionType.SOSTITUZIONE : AcquisitionType.PROGRAMMATO,
    tipoApparecchiatura: EquipmentType.GENERALE,
    nomeApparecchiatura: f.descrizione.slice(0, 100),
    descrizioneDettagliata: [f.descrizione, extra].filter(Boolean).join('\n\n'),
    caratteristicheTecniche: f.caratteristicheTecniche,
    motivazioneRichiesta: f.miglioramentiAttesi || f.proceduraDiagnosi || f.descrizione,
    impattoAssistenziale: f.miglioramentiAttesi,
    esistonoAlternative: f.tecnologieStessaTipologia === 'si',
    descrizioneAlternative: f.specificareTecnologie || undefined,
    isSostituzione,
    apparecchiaturaSOStituita: isSostituzione ? f.codFuoriUso || undefined : undefined,
    motivoSostituzione: isSostituzione ? 'ALTRO' : undefined,
    dettaglioMotivoSostituzione: isSostituzione
      ? `Fuori uso dichiarato nel MOD.01 (cod. ${f.codFuoriUso || 'n.d.'})`
      : undefined,
    unitaOperativa: f.repartoDestinatario,
    dipartimento: f.presidioUtilizzo,
    budget: budgetBase(importo, f.progettoFinalizzato === 'si' ? f.codProgetto : undefined),
    richiedeService: false,
    richiedeConsumabili: false,
    isDonazione: false,
    richiedeAdeguamentiStrutturali: false,
    studioFattibilitaRichiesto: false,
  };
}

// ---------------------------------------------------------------------------
// MOD.02 — Richiesta ecografi
// ---------------------------------------------------------------------------

export interface Mod02Input {
  richiedente: string;
  telefono: string;
  email: string;
  repartoDestinatario: string;
  presidioUtilizzo: string;
  caratteristicheTecniche: string;
  motivoAcquisizione: 'incremento' | 'sostituzione' | 'aggiornamento' | '';
  codFuoriUso: string;
  apparecchiatureDaSostituire: string;
  accessori: string;
  miglioramentiAttesi: string;
  valutazioneQualitativa: string;
  volumiAttivita: string;
  volumiPrevisti: string;
  comeVienesvoltaAttualmente: string;
  risorseNecessarie: string;
  localeInstallazione: string;
  tipoContratto: 'acquisto' | 'leasing' | 'service' | 'noleggio' | '';
  costoAcquisto: string;
  costoNoleggioServiceLeasing: string;
  costoConsumabili: string;
  progettoFinalizzato: 'si' | 'no' | '';
  codProgetto: string;
  note: string;
}

export function mapMod02ToRequest(f: Mod02Input): Partial<TechnologyRequest> {
  const isSostituzione = f.motivoAcquisizione === 'sostituzione';
  const importo = f.tipoContratto === 'acquisto' || f.costoAcquisto
    ? f.costoAcquisto
    : f.costoNoleggioServiceLeasing;

  const extra = righeNonVuote([
    ['Accessori', f.accessori],
    ['Volumi attività attuali', f.volumiAttivita],
    ['Volumi previsti', f.volumiPrevisti],
    ['Come svolta attualmente', f.comeVienesvoltaAttualmente],
    ['Risorse accessorie', f.risorseNecessarie],
    ['Locale installazione', f.localeInstallazione],
    ['Tipo contratto', f.tipoContratto],
    ['Costo consumabili stimato', f.costoConsumabili],
    ['Note', f.note],
    ['Modulo di origine', 'MOD.02_TS (ecografi)'],
  ]);

  return {
    tipoAcquisto: isSostituzione ? AcquisitionType.SOSTITUZIONE : AcquisitionType.PROGRAMMATO,
    tipoApparecchiatura: EquipmentType.ECOGRAFO,
    nomeApparecchiatura: 'Ecografo',
    descrizioneDettagliata: [f.caratteristicheTecniche, extra].filter(Boolean).join('\n\n'),
    caratteristicheTecniche: f.caratteristicheTecniche,
    motivazioneRichiesta: f.valutazioneQualitativa || f.miglioramentiAttesi,
    impattoAssistenziale: f.miglioramentiAttesi,
    esistonoAlternative: false,
    isSostituzione,
    apparecchiaturaSOStituita: isSostituzione
      ? f.apparecchiatureDaSostituire || f.codFuoriUso || undefined
      : undefined,
    motivoSostituzione: isSostituzione ? 'ALTRO' : undefined,
    dettaglioMotivoSostituzione: isSostituzione
      ? `Sostituzione dichiarata nel MOD.02 (cod. ${f.codFuoriUso || 'n.d.'})`
      : undefined,
    unitaOperativa: f.repartoDestinatario,
    dipartimento: f.presidioUtilizzo,
    budget: budgetBase(importo, f.progettoFinalizzato === 'si' ? f.codProgetto : undefined),
    richiedeService: false,
    richiedeConsumabili: false,
    isDonazione: false,
    richiedeAdeguamentiStrutturali: false,
    studioFattibilitaRichiesto: false,
  };
}

// ---------------------------------------------------------------------------
// Fast Track (Track 2)
// ---------------------------------------------------------------------------

export interface FastTrackInput {
  categoria:
    | 'sostituzione_1_1'
    | 'urgenza_workaround'
    | 'upgrade_obbligato'
    | 'sotto_soglia'
    | 'prove_visioni'
    | 'service_estar'
    | 'consumabili_estar'
    | '';
  richiedente: string;
  telefono: string;
  email: string;
  unitaOperativa: string;
  repartoPresidio: string;
  descrizione: string;
  motivazione: string;
  marca: string;
  modello: string;
  numeroInventarioVecchio: string;
  motivoDismissione: 'fuori_uso' | 'obsolescenza' | 'fine_vita' | 'altro' | '';
  motivoDismissioneAltro: string;
  impattoAssistenziale: 'critico' | 'alto' | 'medio' | 'basso' | '';
  numeroConvenzioneESTAR: string;
  numeroDetESTAR: string;
  fornitoreAggiudicato: string;
  costoStimato: string;
  workaroundDisponibile: string;
  note: string;
}

function mapMotivoDismissione(
  m: FastTrackInput['motivoDismissione']
): TechnologyRequest['motivoSostituzione'] {
  switch (m) {
    case 'fuori_uso':
      return 'NON_RIPARABILE';
    case 'obsolescenza':
    case 'fine_vita':
      return 'OBSOLETO';
    case 'altro':
      return 'ALTRO';
    default:
      return undefined;
  }
}

export function mapFastTrackToRequest(f: FastTrackInput): Partial<TechnologyRequest> {
  const isSostituzione = f.categoria === 'sostituzione_1_1';
  const riferimentiESTAR = Boolean(
    f.numeroConvenzioneESTAR || f.numeroDetESTAR || f.fornitoreAggiudicato
  );
  const importo = parseItalianNumber(f.costoStimato);

  const extra = righeNonVuote([
    ['Categoria Fast Track', f.categoria],
    ['Marca/Modello', [f.marca, f.modello].filter(Boolean).join(' ')],
    ['Inventario apparecchiatura sostituita', f.numeroInventarioVecchio],
    ['Convenzione ESTAR', f.numeroConvenzioneESTAR],
    ['Determina ESTAR', f.numeroDetESTAR],
    ['Fornitore aggiudicato', f.fornitoreAggiudicato],
    ['Workaround disponibile', f.workaroundDisponibile],
    ['Note', f.note],
    ['Modulo di origine', 'Fast Track (Allegato 2)'],
  ]);

  const base: Partial<TechnologyRequest> = {
    tipoAcquisto: isSostituzione ? AcquisitionType.SOSTITUZIONE : AcquisitionType.PROGRAMMATO,
    tipoApparecchiatura: EquipmentType.GENERALE,
    nomeApparecchiatura: (f.descrizione || [f.marca, f.modello].filter(Boolean).join(' ')).slice(0, 100),
    descrizioneDettagliata: [f.descrizione, extra].filter(Boolean).join('\n\n'),
    caratteristicheTecniche: [f.marca, f.modello].filter(Boolean).join(' '),
    motivazioneRichiesta: f.motivazione,
    impattoAssistenziale: f.impattoAssistenziale,
    esistonoAlternative: f.workaroundDisponibile.trim() !== '',
    descrizioneAlternative: f.workaroundDisponibile || undefined,
    isSostituzione,
    sostituzioneGiaAggiudicata: isSostituzione ? riferimentiESTAR : undefined,
    apparecchiaturaSOStituita: f.numeroInventarioVecchio || undefined,
    motivoSostituzione:
      f.categoria === 'upgrade_obbligato' ? 'UPGRADE_OBBLIGATO' : mapMotivoDismissione(f.motivoDismissione),
    dettaglioMotivoSostituzione: f.motivoDismissioneAltro || undefined,
    unitaOperativa: f.unitaOperativa,
    dipartimento: f.repartoPresidio,
    budget: budgetBase(f.costoStimato),
    richiedeService: false,
    richiedeConsumabili: false,
    isDonazione: false,
    richiedeAdeguamentiStrutturali: false,
    studioFattibilitaRichiesto: false,
  };

  if (f.categoria === 'service_estar') {
    base.richiedeService = true;
    base.service = {
      serviceGiaAggiudicatoESTAR: riferimentiESTAR,
      numeroDeliberaESTAR: f.numeroDetESTAR || f.numeroConvenzioneESTAR || undefined,
      fornitore: f.fornitoreAggiudicato,
      durataContrattualeAnni: 1,
      canoneAnnuo: importo,
      valoreTotaleContratto: importo,
      consumabiliInclusi: 'NESSUNO',
      penaliUscitaAnticipata: false,
      tipoRichiestaService: 'RINNOVO',
    };
  }

  if (f.categoria === 'consumabili_estar') {
    base.richiedeConsumabili = true;
    base.consumabili = {
      consumabiliGiaGaraESTAR: riferimentiESTAR,
      numeroDeliberaESTAR: f.numeroDetESTAR || f.numeroConvenzioneESTAR || undefined,
      tipologia: f.descrizione || 'Consumabili',
      fornitore: f.fornitoreAggiudicato,
      consumoAnnuoStimato: importo,
      tipoConsumabile: 'GENERICI',
      motivazioneRichiesta: 'RIORDINO_URGENTE',
      esistonoAlternative: true,
    };
  }

  return base;
}

// ---------------------------------------------------------------------------
// Procedura Semplificata (Track 3)
// ---------------------------------------------------------------------------

export interface SemplificatoInput {
  categoria: 'donazione' | 'ampliamento' | 'upgrade' | '';
  richiedente: string;
  dipartimento: string;
  telefono: string;
  email: string;
  unitaOperativa: string;
  repartoPresidio: string;
  descrizione: string;
  motivazione: string;
  marca: string;
  modello: string;
  quantita: string;
  giaAggiudicataESTAR: 'si' | 'no' | '';
  numeroDetESTAR: string;
  fornitore: string;
  donatore: string;
  valoreDonazione: string;
  materialiDedicati: 'si' | 'no' | '';
  tecnologiaConosciuta: 'si' | 'no' | '';
  giustificazioneAmpliamento: string;
  tipoUpgrade: string;
  attrezzaturaInteressata: string;
  costoStimato: string;
  fonteFinanziamento: string;
  impattoOrganizzativo: string;
  adeguamentiStrutturali: 'si' | 'no' | '';
  note: string;
}

export function mapSemplificatoToRequest(f: SemplificatoInput): Partial<TechnologyRequest> {
  const isDonazione = f.categoria === 'donazione';
  const valoreDonazione = parseItalianNumber(f.valoreDonazione);
  const importo = isDonazione ? f.valoreDonazione : f.costoStimato;

  const extra = righeNonVuote([
    ['Categoria', f.categoria],
    ['Marca/Modello', [f.marca, f.modello].filter(Boolean).join(' ')],
    ['Quantità', f.quantita],
    ['Determina ESTAR', f.numeroDetESTAR],
    ['Fornitore', f.fornitore],
    ['Donatore', f.donatore],
    ['Giustificazione ampliamento', f.giustificazioneAmpliamento],
    ['Tipo upgrade', f.tipoUpgrade],
    ['Attrezzatura interessata', f.attrezzaturaInteressata],
    ['Impatto organizzativo', f.impattoOrganizzativo],
    ['Note', f.note],
    ['Modulo di origine', 'Procedura Semplificata (Allegato 3)'],
  ]);

  // Il criterio triage per gli ampliamenti cerca "ampliamento" nella
  // motivazione: il mapper lo garantisce indipendentemente dal testo digitato
  const motivazione =
    f.categoria === 'ampliamento'
      ? `Ampliamento dotazione — ${f.motivazione || f.giustificazioneAmpliamento}`
      : f.motivazione;

  return {
    tipoAcquisto: isDonazione
      ? AcquisitionType.DONAZIONE
      : AcquisitionType.PROGRAMMATO,
    tipoApparecchiatura: EquipmentType.GENERALE,
    nomeApparecchiatura: (f.descrizione || [f.marca, f.modello].filter(Boolean).join(' ')).slice(0, 100),
    descrizioneDettagliata: [f.descrizione, extra].filter(Boolean).join('\n\n'),
    caratteristicheTecniche: [f.marca, f.modello].filter(Boolean).join(' '),
    motivazioneRichiesta: motivazione,
    impattoAssistenziale: f.impattoOrganizzativo,
    esistonoAlternative: false,
    isSostituzione: false,
    motivoSostituzione: f.categoria === 'upgrade' ? 'UPGRADE_OBBLIGATO' : undefined,
    dettaglioMotivoSostituzione: f.categoria === 'upgrade' ? f.tipoUpgrade || undefined : undefined,
    unitaOperativa: f.unitaOperativa,
    dipartimento: f.dipartimento || f.repartoPresidio,
    budget: {
      ...budgetBase(importo, f.fonteFinanziamento, isDonazione ? 'DONAZIONE' : 'ALTRO'),
      ...(isDonazione ? { fonteFinanziamento: 'DONAZIONE' as const } : {}),
    },
    richiedeService: false,
    richiedeConsumabili: false,
    isDonazione,
    donazione: isDonazione
      ? {
          donatoreIdentificato: f.donatore.trim() !== '',
          nomeDonatore: f.donatore || undefined,
          valoreDonazione,
          materialiUsoDecicati: f.materialiDedicati === 'si',
          conformeDGR306: f.materialiDedicati !== 'si',
          tecnologiaGiaAggiudicata: f.giaAggiudicataESTAR === 'si',
          tecnologiaConosciuta: f.tecnologiaConosciuta === 'si',
          eligibileProceduraSemplificata:
            f.materialiDedicati !== 'si' && valoreDonazione < 50000,
        }
      : undefined,
    richiedeAdeguamentiStrutturali: f.adeguamentiStrutturali === 'si',
    studioFattibilitaRichiesto: false,
  };
}
