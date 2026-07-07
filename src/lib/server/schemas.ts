/**
 * SCHEMI ZOD LATO SERVER (BFF)
 * Validazione dei payload delle scritture critiche: il client non è fidato.
 */

import { z } from 'zod';
import { AcquisitionType, EquipmentType, Priority, RequestStatus } from '@/types';

const importoEuro = z.number().finite().min(0).max(100_000_000);

const budgetSchema = z.object({
  valoreStimatoEuro: importoEuro,
  ivaEsclusa: z.boolean(),
  fonteFinanziamento: z.enum([
    'PIANO_INVESTIMENTI',
    'FONDO_INDISTINTO',
    'FONDI_STATALI',
    'DONAZIONE',
    'ALTRO',
  ]),
  dettaglioFonte: z.string().max(2000).optional(),
  annoRiferimento: z.number().int().min(2020).max(2100),
  capitoloBilancio: z.string().max(200).optional(),
  budgetDisponibile: z.boolean(),
  importoDisponibile: importoEuro.optional(),
  richiestaIntegrazione: z.boolean(),
  importoIntegrazione: importoEuro.optional(),
  validatoUSLPM: z.boolean().optional().default(false),
});

const donazioneSchema = z.object({
  donatoreIdentificato: z.boolean(),
  nomeDonatore: z.string().max(500).optional(),
  valoreDonazione: importoEuro,
  materialiUsoDecicati: z.boolean(),
  conformeDGR306: z.boolean(),
  tecnologiaGiaAggiudicata: z.boolean(),
  tecnologiaConosciuta: z.boolean(),
  eligibileProceduraSemplificata: z.boolean(),
  motivazioneHTACompleto: z.string().max(2000).optional(),
});

const serviceSchema = z.object({
  serviceGiaAggiudicatoESTAR: z.boolean(),
  numeroDeliberaESTAR: z.string().max(200).optional(),
  fornitore: z.string().max(500),
  durataContrattualeAnni: z.number().int().min(0).max(50),
  canoneAnnuo: importoEuro,
  valoreTotaleContratto: importoEuro,
  consumabiliInclusi: z.enum(['DEDICATI', 'GENERICI', 'NESSUNO']),
  penaliUscitaAnticipata: z.boolean(),
  percentualePenale: z.number().min(0).max(100).optional(),
  tipoRichiestaService: z.enum(['RINNOVO', 'ESTENSIONE', 'NUOVO']),
});

const consumabiliSchema = z.object({
  consumabiliGiaGaraESTAR: z.boolean(),
  numeroDeliberaESTAR: z.string().max(200).optional(),
  tipologia: z.string().max(500),
  fornitore: z.string().max(500),
  consumoAnnuoStimato: importoEuro,
  tipoConsumabile: z.enum(['DEDICATI', 'GENERICI']),
  motivazioneRichiesta: z.enum(['INCREMENTO_VOLUMI', 'NUOVA_TECNOLOGIA', 'RIORDINO_URGENTE', 'ALTRO']),
  percentualeIncremento: z.number().min(0).max(1000).optional(),
  altroMotivo: z.string().max(2000).optional(),
  esistonoAlternative: z.boolean(),
  noteAlternative: z.string().max(2000).optional(),
});

/**
 * Payload di sottomissione richiesta (POST /api/richieste).
 * .strict() sui sotto-oggetti no: i mapper client possono evolvere; le chiavi
 * NON dichiarate qui vengono però SCARTATE (il server ricostruisce il record).
 */
export const submitRequestSchema = z.object({
  tipoAcquisto: z.nativeEnum(AcquisitionType),
  tipoApparecchiatura: z.nativeEnum(EquipmentType),
  priorita: z.nativeEnum(Priority).optional(),
  nomeApparecchiatura: z.string().min(1).max(500),
  descrizioneDettagliata: z.string().min(1).max(20000),
  caratteristicheTecniche: z.string().max(20000).optional(),
  motivazioneRichiesta: z.string().min(1).max(20000),
  impattoAssistenziale: z.string().max(20000).optional(),
  esistonoAlternative: z.boolean().optional(),
  descrizioneAlternative: z.string().max(20000).optional(),
  unitaOperativa: z.string().min(1).max(500),
  dipartimento: z.string().min(1).max(500),
  zonaDistretto: z.string().max(500).optional(),
  urgenzaSafetyCritica: z.boolean().optional(),
  urgenzaBloccoServizio: z.boolean().optional(),
  urgenzaObbligoNormativo: z.boolean().optional(),
  isSostituzione: z.boolean(),
  sostituzioneGiaAggiudicata: z.boolean().optional(),
  apparecchiaturaSOStituita: z.string().max(500).optional(),
  motivoSostituzione: z.enum(['NON_RIPARABILE', 'OBSOLETO', 'UPGRADE_OBBLIGATO', 'ALTRO']).optional(),
  dettaglioMotivoSostituzione: z.string().max(2000).optional(),
  budget: budgetSchema,
  richiedeService: z.boolean(),
  service: serviceSchema.optional(),
  richiedeConsumabili: z.boolean(),
  consumabili: consumabiliSchema.optional(),
  isDonazione: z.boolean(),
  donazione: donazioneSchema.optional(),
  richiedeAdeguamentiStrutturali: z.boolean(),
  descrizioneAdeguamenti: z.string().max(20000).optional(),
  studioFattibilitaRichiesto: z.boolean().optional(),
  richiedeHTARegionale: z.boolean().optional(),
});

export type SubmitRequestPayload = z.infer<typeof submitRequestSchema>;

/**
 * Payload transizione di stato (POST /api/richieste/[id]/transizioni)
 */
export const transitionSchema = z.object({
  toStatus: z.nativeEnum(RequestStatus),
  note: z.string().max(20000).optional(),
});

export type TransitionPayload = z.infer<typeof transitionSchema>;

export const guidSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
