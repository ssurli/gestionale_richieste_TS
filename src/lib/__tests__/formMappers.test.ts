/**
 * Test dei mapper form → TechnologyRequest (src/lib/formMappers.ts)
 * e della loro coerenza con il triage.
 */

import { describe, test, expect } from 'vitest';
import {
  mapMod01ToRequest,
  mapMod02ToRequest,
  mapFastTrackToRequest,
  mapSemplificatoToRequest,
  mapFonteFinanziamento,
  Mod01Input,
  FastTrackInput,
  SemplificatoInput,
} from '@/lib/formMappers';
import { eseguiTriage } from '@/lib/triage';
import { AcquisitionType, EquipmentType, TrackType } from '@/types';

function mod01Base(overrides: Partial<Mod01Input> = {}): Mod01Input {
  return {
    richiedente: 'Mario Bianchi',
    telefono: '000',
    email: 'x@example.invalid',
    repartoDestinatario: 'Cardiologia',
    presidioUtilizzo: 'Presidio Livorno',
    descrizione: 'Elettrocardiografo 12 derivazioni',
    quantita: '2',
    caratteristicheTecniche: '12 derivazioni, carrello',
    proceduraDiagnosi: 'ECG ambulatoriali',
    comeVienesvoltaAttualmente: 'Con apparecchio a noleggio',
    motivoAcquisizione: 'incremento',
    codFuoriUso: '',
    tecnologieStessaTipologia: 'si',
    specificareTecnologie: 'ECG portatile in dotazione',
    miglioramentiAttesi: 'Riduzione attese',
    tipoContratto: 'acquisto',
    costoAcquisto: '12.500,00',
    costoNoleggioServiceLeasing: '',
    costoConsumabili: '',
    progettoFinalizzato: 'no',
    codProgetto: '',
    note: '',
    ...overrides,
  };
}

function fastTrackBase(overrides: Partial<FastTrackInput> = {}): FastTrackInput {
  return {
    categoria: 'sostituzione_1_1',
    richiedente: 'Mario Bianchi',
    telefono: '000',
    email: 'x@example.invalid',
    unitaOperativa: 'Radiologia',
    repartoPresidio: 'Presidio Lucca',
    descrizione: 'Sostituzione monitor multiparametrico',
    motivazione: 'Apparecchio fuori uso',
    marca: 'Acme',
    modello: 'M100',
    numeroInventarioVecchio: 'INV-123',
    motivoDismissione: 'fuori_uso',
    motivoDismissioneAltro: '',
    impattoAssistenziale: 'alto',
    numeroConvenzioneESTAR: 'CONV-9',
    numeroDetESTAR: '',
    fornitoreAggiudicato: 'Acme SpA',
    costoStimato: '8.000',
    workaroundDisponibile: '',
    note: '',
    ...overrides,
  };
}

function semplificatoBase(overrides: Partial<SemplificatoInput> = {}): SemplificatoInput {
  return {
    categoria: 'donazione',
    richiedente: 'Mario Bianchi',
    dipartimento: 'Dipartimento Specialistiche',
    telefono: '000',
    email: 'x@example.invalid',
    unitaOperativa: 'Oculistica',
    repartoPresidio: 'Presidio Pisa',
    descrizione: 'Lampada a fessura',
    motivazione: 'Donazione associazione locale',
    marca: 'Acme',
    modello: 'L200',
    quantita: '1',
    giaAggiudicataESTAR: 'si',
    numeroDetESTAR: 'DET-1',
    fornitore: 'Acme SpA',
    donatore: 'Associazione Amici',
    valoreDonazione: '18.000',
    materialiDedicati: 'no',
    tecnologiaConosciuta: 'si',
    giustificazioneAmpliamento: '',
    tipoUpgrade: '',
    attrezzaturaInteressata: '',
    costoStimato: '',
    fonteFinanziamento: '',
    impattoOrganizzativo: 'Nessuno',
    adeguamentiStrutturali: 'no',
    note: '',
    ...overrides,
  };
}

describe('mapFonteFinanziamento', () => {
  test('riconosce il piano investimenti dal testo libero', () => {
    expect(mapFonteFinanziamento('Piano investimenti 2026').fonteFinanziamento).toBe('PIANO_INVESTIMENTI');
  });
  test('testo non riconosciuto → ALTRO con dettaglio conservato', () => {
    const r = mapFonteFinanziamento('fondi di reparto');
    expect(r.fonteFinanziamento).toBe('ALTRO');
    expect(r.dettaglioFonte).toBe('fondi di reparto');
  });
});

describe('mapMod01ToRequest', () => {
  test('campi core mappati e importo in formato italiano parsato', () => {
    const r = mapMod01ToRequest(mod01Base());
    expect(r.tipoAcquisto).toBe(AcquisitionType.PROGRAMMATO);
    expect(r.tipoApparecchiatura).toBe(EquipmentType.GENERALE);
    expect(r.nomeApparecchiatura).toBe('Elettrocardiografo 12 derivazioni');
    expect(r.budget?.valoreStimatoEuro).toBe(12500);
    expect(r.esistonoAlternative).toBe(true);
    expect(r.unitaOperativa).toBe('Cardiologia');
    // i campi del modulo cartaceo senza colonna dedicata restano nella descrizione
    expect(r.descrizioneDettagliata).toContain('Quantità: 2');
    expect(r.descrizioneDettagliata).toContain('MOD.01_TS');
  });

  test('sostituzione → tipoAcquisto SOSTITUZIONE + dettagli', () => {
    const r = mapMod01ToRequest(mod01Base({ motivoAcquisizione: 'sostituzione', codFuoriUso: 'FU-9' }));
    expect(r.tipoAcquisto).toBe(AcquisitionType.SOSTITUZIONE);
    expect(r.isSostituzione).toBe(true);
    expect(r.apparecchiaturaSOStituita).toBe('FU-9');
  });

  test('MOD.01 sotto soglia → triage FAST_TRACK', () => {
    const r = mapMod01ToRequest(mod01Base());
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.FAST_TRACK);
  });
});

describe('mapMod02ToRequest', () => {
  test('ecografo → tipoApparecchiatura ECOGRAFO', () => {
    const r = mapMod02ToRequest({
      richiedente: 'x',
      telefono: '',
      email: '',
      repartoDestinatario: 'Radiologia',
      presidioUtilizzo: 'Presidio',
      caratteristicheTecniche: 'Ecografo multidisciplinare',
      motivoAcquisizione: 'sostituzione',
      codFuoriUso: 'FU-1',
      apparecchiatureDaSostituire: 'Ecografo XY',
      accessori: '',
      miglioramentiAttesi: 'Migliore qualità immagine',
      valutazioneQualitativa: 'Necessario per ambulatorio',
      volumiAttivita: '1000',
      volumiPrevisti: '1200',
      comeVienesvoltaAttualmente: '',
      risorseNecessarie: '',
      localeInstallazione: '',
      tipoContratto: 'acquisto',
      costoAcquisto: '45.000',
      costoNoleggioServiceLeasing: '',
      costoConsumabili: '',
      progettoFinalizzato: 'no',
      codProgetto: '',
      note: '',
    });
    expect(r.tipoApparecchiatura).toBe(EquipmentType.ECOGRAFO);
    expect(r.isSostituzione).toBe(true);
    expect(r.apparecchiaturaSOStituita).toBe('Ecografo XY');
    expect(r.budget?.valoreStimatoEuro).toBe(45000);
  });
});

describe('mapFastTrackToRequest', () => {
  test('sostituzione 1:1 con riferimenti ESTAR → sostituzioneGiaAggiudicata e triage FAST_TRACK', () => {
    const r = mapFastTrackToRequest(fastTrackBase());
    expect(r.isSostituzione).toBe(true);
    expect(r.sostituzioneGiaAggiudicata).toBe(true);
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.FAST_TRACK);
  });

  test('sostituzione 1:1 SENZA riferimenti ESTAR → non dichiarata aggiudicata', () => {
    const r = mapFastTrackToRequest(
      fastTrackBase({ numeroConvenzioneESTAR: '', numeroDetESTAR: '', fornitoreAggiudicato: '' })
    );
    expect(r.sostituzioneGiaAggiudicata).toBe(false);
  });

  test('service ESTAR → ServiceContract da rinnovo aggiudicato', () => {
    const r = mapFastTrackToRequest(
      fastTrackBase({ categoria: 'service_estar', numeroDetESTAR: 'DET-5', costoStimato: '10.000' })
    );
    expect(r.richiedeService).toBe(true);
    expect(r.service?.serviceGiaAggiudicatoESTAR).toBe(true);
    expect(r.service?.canoneAnnuo).toBe(10000);
  });

  test('consumabili ESTAR → Consumables coerente', () => {
    const r = mapFastTrackToRequest(fastTrackBase({ categoria: 'consumabili_estar' }));
    expect(r.richiedeConsumabili).toBe(true);
    expect(r.consumabili?.consumabiliGiaGaraESTAR).toBe(true);
  });
});

describe('mapSemplificatoToRequest', () => {
  test('donazione conforme → Donation completa e triage SEMPLIFICATA', () => {
    const r = mapSemplificatoToRequest(semplificatoBase());
    expect(r.isDonazione).toBe(true);
    expect(r.tipoAcquisto).toBe(AcquisitionType.DONAZIONE);
    expect(r.donazione?.valoreDonazione).toBe(18000);
    expect(r.donazione?.materialiUsoDecicati).toBe(false);
    expect(r.budget?.fonteFinanziamento).toBe('DONAZIONE');
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.SEMPLIFICATA);
  });

  test('donazione con materiali dedicati → mappata come non conforme', () => {
    const r = mapSemplificatoToRequest(semplificatoBase({ materialiDedicati: 'si' }));
    expect(r.donazione?.materialiUsoDecicati).toBe(true);
    expect(r.donazione?.conformeDGR306).toBe(false);
    const triage = eseguiTriage(r);
    expect(triage.trackAssegnato).toBe(TrackType.HTA_COMPLETO);
    expect(triage.warning?.join(' ')).toContain('DGR 306/2024');
  });

  test('ampliamento → motivazione garantisce il criterio triage → SEMPLIFICATA', () => {
    const r = mapSemplificatoToRequest(
      semplificatoBase({
        categoria: 'ampliamento',
        motivazione: 'Serve un secondo apparecchio',
        costoStimato: '20.000',
        fonteFinanziamento: 'Piano investimenti',
      })
    );
    expect(r.isDonazione).toBe(false);
    expect(r.motivazioneRichiesta?.toLowerCase()).toContain('ampliamento');
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.SEMPLIFICATA);
  });

  test('adeguamenti strutturali dichiarati → flag mappato (triage → HTA)', () => {
    const r = mapSemplificatoToRequest(
      semplificatoBase({ categoria: 'ampliamento', adeguamentiStrutturali: 'si', costoStimato: '20.000' })
    );
    expect(r.richiedeAdeguamentiStrutturali).toBe(true);
    expect(eseguiTriage(r).trackAssegnato).toBe(TrackType.HTA_COMPLETO);
  });
});
