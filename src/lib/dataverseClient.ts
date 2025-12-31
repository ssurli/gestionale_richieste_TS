/**
 * Microsoft Dataverse REST API Client
 * Gestisce tutte le chiamate API a Dataverse per persistenza dati
 */

import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, tokenRequest } from './msalConfig';
import type { TechnologyRequest, User, TrackType, RequestStatus } from '../types';

const DATAVERSE_URL = process.env.NEXT_PUBLIC_DATAVERSE_URL || '';
const API_VERSION = process.env.NEXT_PUBLIC_DATAVERSE_API_VERSION || 'v9.2';

export class DataverseClient {
  private msalInstance: PublicClientApplication;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  /**
   * Ottiene access token per Dataverse
   */
  private async getAccessToken(): Promise<string> {
    const accounts = this.msalInstance.getAllAccounts();

    if (accounts.length === 0) {
      throw new Error('Nessun utente autenticato. Effettua il login.');
    }

    const account = accounts[0];

    try {
      // Prova silent token acquisition
      const response = await this.msalInstance.acquireTokenSilent({
        ...tokenRequest,
        account,
      });

      return response.accessToken;
    } catch (error) {
      // Se silent fallisce, richiedi login interattivo
      const response = await this.msalInstance.acquireTokenPopup(tokenRequest);
      return response.accessToken;
    }
  }

  /**
   * Headers comuni per richieste Dataverse
   */
  private async getHeaders(includeContentType = true): Promise<HeadersInit> {
    const token = await this.getAccessToken();

    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'return=representation', // Ritorna l'oggetto creato/modificato
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  // ========================================================================
  // RICHIESTE TECNOLOGIE (ts_richiestes)
  // ========================================================================

  /**
   * Crea una nuova richiesta
   */
  async createRequest(data: Partial<TechnologyRequest>): Promise<string> {
    const headers = await this.getHeaders();

    const body = {
      ts_numero_progressivo: data.numeroProgressivo,
      ts_nome_apparecchiatura: data.nomeApparecchiatura,
      ts_descrizione: data.descrizioneDettagliata,
      ts_track: data.trackAssegnato,
      ts_stato: data.statoCorrente,
      ts_tipo_acquisto: data.tipoAcquisto,
      ts_tipo_apparecchiatura: data.tipoApparecchiatura,
      ts_unita_operativa: data.unitaOperativa,
      ts_dipartimento: data.dipartimento,
      ts_budget_stimato: data.budget?.valoreStimatoEuro,
      ts_motivazione_richiesta: data.motivazioneRichiesta,
      ts_impatto_assistenziale: data.impattoAssistenziale,
      ts_priorita: data.priorita,
      ts_is_sostituzione: data.isSostituzione,
      ts_motivazione_sostituzione: data.motivoSostituzione,
      ts_dettaglio_motivo_sostituzione: data.dettaglioMotivoSostituzione,
      ts_richiede_service: data.richiedeService,
      ts_richiede_consumabili: data.richiedeConsumabili,
      ts_is_donazione: data.isDonazione,
      ts_richiede_adeguamenti: data.richiedeAdeguamentiStrutturali,
      ts_descrizione_adeguamenti: data.descrizioneAdeguamenti,
      // Lookup al richiedente (se disponibile)
      // "ts_richiedente@odata.bind": `/ts_utentis(${data.richiedenteId})`
    };

    const response = await fetch(
      `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore creazione richiesta: ${response.status} - ${error}`);
    }

    // Estrai ID dalla response header
    const locationHeader = response.headers.get('OData-EntityId');
    if (!locationHeader) {
      throw new Error('ID richiesta non trovato nella response');
    }

    const id = locationHeader.match(/\(([^)]+)\)/)?.[1];
    return id || '';
  }

  /**
   * Recupera tutte le richieste con filtri opzionali
   */
  async getRequests(filter?: string, orderBy = 'ts_data_creazione desc'): Promise<TechnologyRequest[]> {
    const headers = await this.getHeaders(false);

    let url = `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes`;
    const params: string[] = [];

    if (orderBy) {
      params.push(`$orderby=${orderBy}`);
    }

    if (filter) {
      params.push(`$filter=${filter}`);
    }

    // Espandi lookup per richiedente
    params.push('$expand=ts_richiedente($select=ts_nome,ts_cognome,ts_email)');

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore recupero richieste: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return this.mapDataverseToRequests(data.value);
  }

  /**
   * Recupera una richiesta per ID
   */
  async getRequestById(id: string): Promise<TechnologyRequest | null> {
    const headers = await this.getHeaders(false);

    const url = `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes(${id})?$expand=ts_richiedente`;

    const response = await fetch(url, { headers });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore recupero richiesta: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return this.mapDataverseToRequest(data);
  }

  /**
   * Aggiorna una richiesta esistente
   */
  async updateRequest(id: string, updates: Partial<TechnologyRequest>): Promise<void> {
    const headers = await this.getHeaders();

    const body: any = {};

    if (updates.statoCorrente) body.ts_stato = updates.statoCorrente;
    if (updates.trackAssegnato) body.ts_track = updates.trackAssegnato;
    if (updates.nomeApparecchiatura) body.ts_nome_apparecchiatura = updates.nomeApparecchiatura;
    if (updates.descrizioneDettagliata) body.ts_descrizione = updates.descrizioneDettagliata;
    if (updates.budget?.valoreStimatoEuro) body.ts_budget_stimato = updates.budget.valoreStimatoEuro;
    if (updates.motivazioneRichiesta) body.ts_motivazione_richiesta = updates.motivazioneRichiesta;

    // Aggiungi sempre data ultima modifica
    body.ts_data_ultima_modifica = new Date().toISOString();

    const response = await fetch(
      `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes(${id})`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore aggiornamento richiesta: ${response.status} - ${error}`);
    }
  }

  /**
   * Elimina una richiesta
   */
  async deleteRequest(id: string): Promise<void> {
    const headers = await this.getHeaders(false);

    const response = await fetch(
      `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes(${id})`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Errore eliminazione richiesta: ${response.status} - ${error}`);
    }
  }

  // ========================================================================
  // UTENTI (ts_utentis)
  // ========================================================================

  /**
   * Recupera utente corrente dal token
   */
  async getCurrentUser(): Promise<User | null> {
    const accounts = this.msalInstance.getAllAccounts();

    if (accounts.length === 0) {
      return null;
    }

    const account = accounts[0];
    const email = account.username;

    // Cerca utente in Dataverse per email
    const headers = await this.getHeaders(false);

    const filter = `ts_email eq '${email}'`;
    const url = `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_utentis?$filter=${filter}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.value.length === 0) {
      // Utente non esiste in Dataverse, crealo
      return this.createUserFromAccount(account);
    }

    return this.mapDataverseToUser(data.value[0]);
  }

  /**
   * Crea utente da account Microsoft
   */
  private async createUserFromAccount(account: any): Promise<User> {
    const headers = await this.getHeaders();

    const [nome, cognome] = (account.name || '').split(' ');

    const body = {
      ts_email: account.username,
      ts_nome: nome || account.username.split('@')[0],
      ts_cognome: cognome || '',
      ts_azure_ad_objectid: account.localAccountId,
      ts_attivo: true,
      ts_ruolo: 'RESPONSABILE_UO', // Ruolo default
    };

    const response = await fetch(
      `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_utentis`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error('Errore creazione utente');
    }

    const locationHeader = response.headers.get('OData-EntityId');
    const id = locationHeader?.match(/\(([^)]+)\)/)?.[1] || '';

    return {
      id,
      nome: body.ts_nome,
      cognome: body.ts_cognome,
      email: body.ts_email,
      ruolo: body.ts_ruolo as any,
      attivo: true,
      dataCreazione: new Date(),
    };
  }

  // ========================================================================
  // WORKFLOW HISTORY (ts_workflow_histories)
  // ========================================================================

  /**
   * Aggiungi voce audit trail
   */
  async addWorkflowHistory(
    richiestaId: string,
    utenteId: string,
    azione: string,
    statoPrecedente?: string,
    statoNuovo?: string,
    note?: string
  ): Promise<void> {
    const headers = await this.getHeaders();

    const body = {
      'ts_richiesta@odata.bind': `/ts_richiestes(${richiestaId})`,
      'ts_utente@odata.bind': `/ts_utentis(${utenteId})`,
      ts_azione: azione,
      ts_stato_precedente: statoPrecedente,
      ts_stato_nuovo: statoNuovo,
      ts_note: note,
      ts_data_azione: new Date().toISOString(),
    };

    const response = await fetch(
      `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_workflow_histories`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      console.error('Errore salvataggio workflow history');
    }
  }

  // ========================================================================
  // MAPPING HELPERS
  // ========================================================================

  /**
   * Mappa array Dataverse a TechnologyRequest[]
   */
  private mapDataverseToRequests(data: any[]): TechnologyRequest[] {
    return data.map(item => this.mapDataverseToRequest(item));
  }

  /**
   * Mappa singolo oggetto Dataverse a TechnologyRequest
   */
  private mapDataverseToRequest(item: any): TechnologyRequest {
    return {
      id: item.ts_richiestaid,
      numeroProgressivo: item.ts_numero_progressivo || '',
      dataCreazione: new Date(item.ts_data_creazione || Date.now()),
      dataUltimaModifica: new Date(item.ts_data_ultima_modifica || Date.now()),
      statoCorrente: (item.ts_stato || 'BOZZA') as RequestStatus,
      trackAssegnato: item.ts_track as TrackType | undefined,
      dataAssegnazioneTrack: item.ts_data_assegnazione_track ? new Date(item.ts_data_assegnazione_track) : undefined,
      giorniTrascorsi: item.ts_giorni_trascorsi || 0,
      giorniResiduiTrack: item.ts_giorni_residui_track,
      richiedenteId: item._ts_richiedente_value || '',
      richiedente: item.ts_richiedente ? this.mapDataverseToUser(item.ts_richiedente) : {} as User,
      unitaOperativa: item.ts_unita_operativa || '',
      dipartimento: item.ts_dipartimento || '',
      zonaDistretto: item.ts_zona_distretto,
      tipoAcquisto: item.ts_tipo_acquisto as any,
      tipoApparecchiatura: item.ts_tipo_apparecchiatura as any,
      priorita: item.ts_priorita as any,
      nomeApparecchiatura: item.ts_nome_apparecchiatura || '',
      descrizioneDettagliata: item.ts_descrizione || '',
      caratteristicheTecniche: item.ts_caratteristiche_tecniche || '',
      motivazioneRichiesta: item.ts_motivazione_richiesta || '',
      impattoAssistenziale: item.ts_impatto_assistenziale || '',
      esistonoAlternative: item.ts_esistono_alternative || false,
      descrizioneAlternative: item.ts_descrizione_alternative,
      isSostituzione: item.ts_is_sostituzione || false,
      apparecchiaturaSOStituita: item.ts_apparecchiatura_sostituita,
      motivoSostituzione: item.ts_motivazione_sostituzione as any,
      dettaglioMotivoSostituzione: item.ts_dettaglio_motivo_sostituzione,
      budget: {
        valoreStimatoEuro: item.ts_budget_stimato || 0,
        ivaEsclusa: item.ts_budget_iva_esclusa !== false,
        fonteFinanziamento: item.ts_fonte_finanziamento as any,
        dettaglioFonte: item.ts_dettaglio_fonte,
        annoRiferimento: item.ts_anno_riferimento || new Date().getFullYear(),
        capitoloBilancio: item.ts_capitolo_bilancio,
        budgetDisponibile: item.ts_budget_disponibile !== false,
        importoDisponibile: item.ts_importo_disponibile,
        richiestaIntegrazione: item.ts_richiesta_integrazione || false,
        importoIntegrazione: item.ts_importo_integrazione,
        validatoUSLPM: item.ts_validato_uslpm || false,
        dataValidazioneUSLPM: item.ts_data_validazione_uslpm ? new Date(item.ts_data_validazione_uslpm) : undefined,
        noteUSLPM: item.ts_note_uslpm,
      },
      richiedeService: item.ts_richiede_service || false,
      richiedeConsumabili: item.ts_richiede_consumabili || false,
      isDonazione: item.ts_is_donazione || false,
      richiedeAdeguamentiStrutturali: item.ts_richiede_adeguamenti || false,
      descrizioneAdeguamenti: item.ts_descrizione_adeguamenti,
      studioFattibilitaRichiesto: item.ts_studio_fattibilita || false,
    } as TechnologyRequest;
  }

  /**
   * Mappa Dataverse user a User
   */
  private mapDataverseToUser(item: any): User {
    return {
      id: item.ts_utenteid,
      nome: item.ts_nome || '',
      cognome: item.ts_cognome || '',
      email: item.ts_email || '',
      ruolo: item.ts_ruolo as any,
      unitaOperativa: item.ts_unita_operativa,
      dipartimento: item.ts_dipartimento,
      zonaDistretto: item.ts_zona_distretto,
      telefono: item.ts_telefono,
      attivo: item.ts_attivo !== false,
      dataCreazione: new Date(item.createdon || Date.now()),
    };
  }
}

// Esporta istanza singleton
export const dataverseClient = new DataverseClient();
