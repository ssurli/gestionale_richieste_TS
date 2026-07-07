/**
 * Microsoft Dataverse REST API Client
 * Gestisce tutte le chiamate API a Dataverse per persistenza dati
 */

import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { tokenRequest } from './msalConfig';
import { ensureMsalInitialized } from './msalInstance';
import type { TechnologyRequest, User, TrackType, RequestStatus } from '../types';

const DATAVERSE_URL = process.env.NEXT_PUBLIC_DATAVERSE_URL || '';
const API_VERSION = process.env.NEXT_PUBLIC_DATAVERSE_API_VERSION || 'v9.2';

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
// Throttling/indisponibilità temporanea Dataverse
const RETRYABLE_STATUSES = [429, 503, 504];

const GUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Escapa un valore stringa per l'uso dentro un literal di filtro OData
 * (l'apice si raddoppia): evita che input utente alteri il filtro.
 */
export function odataEscape(value: string): string {
  return value.replace(/'/g, "''");
}

/** Valida che un id sia un GUID prima di interpolarlo nell'URL */
function assertGuid(id: string): string {
  if (!GUID_RE.test(id)) {
    throw new DataverseError(`ID record non valido: "${id}"`);
  }
  return id;
}

/**
 * Errore tipizzato per le chiamate Dataverse: conserva status HTTP e
 * dettaglio del body per diagnosi e per distinguere gli errori a monte.
 */
export class DataverseError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly detail?: string
  ) {
    super(detail ? `${message} — ${detail}` : message);
    this.name = 'DataverseError';
  }
}

export class DataverseClient {
  /**
   * Ottiene access token per Dataverse.
   * Usa l'istanza MSAL condivisa con AuthContext (msalInstance.ts): un'istanza
   * separata non vedrebbe gli account autenticati dal MsalProvider.
   */
  private async getAccessToken(): Promise<string> {
    const msal = await ensureMsalInitialized();
    const accounts = msal.getAllAccounts();

    if (accounts.length === 0) {
      throw new Error('Nessun utente autenticato. Effettua il login.');
    }

    const account = accounts[0];

    try {
      // Prova silent token acquisition
      const response = await msal.acquireTokenSilent({
        ...tokenRequest,
        account,
      });

      return response.accessToken;
    } catch (error) {
      // Popup interattivo SOLO se il problema è davvero l'interazione richiesta
      // (token scaduto/consenso): altri errori (rete, config) vanno propagati,
      // e i browser bloccano comunque i popup fuori da un gesto utente.
      if (error instanceof InteractionRequiredAuthError) {
        const response = await msal.acquireTokenPopup(tokenRequest);
        return response.accessToken;
      }
      throw error;
    }
  }

  /**
   * Esegue una chiamata Dataverse con timeout, retry con backoff esponenziale
   * su 429/503/504 (rispettando Retry-After) e retry sugli errori di rete.
   * `path` è relativo a /api/data/{version}/.
   */
  private async request(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown
  ): Promise<Response> {
    const token = await this.getAccessToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      Accept: 'application/json',
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    // Ha senso solo sulle scritture: chiede a Dataverse l'oggetto creato/modificato
    if (method === 'POST' || method === 'PATCH') {
      headers['Prefer'] = 'return=representation';
    }

    const url = `${DATAVERSE_URL}/api/data/${API_VERSION}/${path}`;

    for (let attempt = 0; ; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timer);
        if (attempt < MAX_RETRIES) {
          await this.backoff(attempt);
          continue;
        }
        throw new DataverseError(
          `Errore di rete verso Dataverse (${method} ${path})`,
          undefined,
          err instanceof Error ? err.message : String(err)
        );
      }
      clearTimeout(timer);

      if (RETRYABLE_STATUSES.includes(response.status) && attempt < MAX_RETRIES) {
        const retryAfterSec = Number(response.headers.get('Retry-After'));
        const overrideMs =
          Number.isFinite(retryAfterSec) && retryAfterSec > 0
            ? retryAfterSec * 1000
            : undefined;
        await this.backoff(attempt, overrideMs);
        continue;
      }

      return response;
    }
  }

  private backoff(attempt: number, overrideMs?: number): Promise<void> {
    const ms = overrideMs ?? Math.min(8_000, 500 * 2 ** attempt);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Lancia DataverseError con status e dettaglio del body se la risposta
   * non è ok. Da usare su ogni chiamata il cui esito non è gestito ad hoc.
   */
  private async ensureOk(response: Response, context: string): Promise<Response> {
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new DataverseError(`${context} (HTTP ${response.status})`, response.status, detail);
    }
    return response;
  }

  // ========================================================================
  // RICHIESTE TECNOLOGIE (ts_richiestes)
  // ========================================================================

  /**
   * Crea una nuova richiesta
   */
  async createRequest(data: Partial<TechnologyRequest>): Promise<string> {
    const body: Record<string, unknown> = {
      // NB: ts_numero_progressivo va generato server-side (Autonumber
      // Dataverse): il client lo invia solo se già assegnato
      ts_numero_progressivo: data.numeroProgressivo,
      ts_nome_apparecchiatura: data.nomeApparecchiatura,
      ts_descrizione: data.descrizioneDettagliata,
      ts_caratteristiche_tecniche: data.caratteristicheTecniche,
      ts_track: data.trackAssegnato,
      ts_stato: data.statoCorrente,
      ts_data_assegnazione_track: data.dataAssegnazioneTrack?.toISOString(),
      ts_motivazione_assegnazione_track: data.motivazioneAssegnazioneTrack,
      ts_tipo_acquisto: data.tipoAcquisto,
      ts_tipo_apparecchiatura: data.tipoApparecchiatura,
      ts_unita_operativa: data.unitaOperativa,
      ts_dipartimento: data.dipartimento,
      ts_zona_distretto: data.zonaDistretto,
      ts_motivazione_richiesta: data.motivazioneRichiesta,
      ts_impatto_assistenziale: data.impattoAssistenziale,
      ts_esistono_alternative: data.esistonoAlternative,
      ts_descrizione_alternative: data.descrizioneAlternative,
      ts_priorita: data.priorita,
      // Urgenza critica: flag strutturati (Track 1)
      ts_urgenza_safety: data.urgenzaSafetyCritica,
      ts_urgenza_blocco_servizio: data.urgenzaBloccoServizio,
      ts_urgenza_obbligo_normativo: data.urgenzaObbligoNormativo,
      // Sostituzione
      ts_is_sostituzione: data.isSostituzione,
      ts_sostituzione_gia_aggiudicata: data.sostituzioneGiaAggiudicata,
      ts_apparecchiatura_sostituita: data.apparecchiaturaSOStituita,
      ts_motivazione_sostituzione: data.motivoSostituzione,
      ts_dettaglio_motivo_sostituzione: data.dettaglioMotivoSostituzione,
      // Budget completo
      ts_budget_stimato: data.budget?.valoreStimatoEuro,
      ts_budget_iva_esclusa: data.budget?.ivaEsclusa,
      ts_fonte_finanziamento: data.budget?.fonteFinanziamento,
      ts_dettaglio_fonte: data.budget?.dettaglioFonte,
      ts_anno_riferimento: data.budget?.annoRiferimento,
      ts_capitolo_bilancio: data.budget?.capitoloBilancio,
      ts_budget_disponibile: data.budget?.budgetDisponibile,
      ts_importo_disponibile: data.budget?.importoDisponibile,
      ts_richiesta_integrazione: data.budget?.richiestaIntegrazione,
      ts_importo_integrazione: data.budget?.importoIntegrazione,
      // Flag
      ts_richiede_service: data.richiedeService,
      ts_richiede_consumabili: data.richiedeConsumabili,
      ts_is_donazione: data.isDonazione,
      ts_richiede_adeguamenti: data.richiedeAdeguamentiStrutturali,
      ts_descrizione_adeguamenti: data.descrizioneAdeguamenti,
      ts_studio_fattibilita: data.studioFattibilitaRichiesto,
    };

    // Lookup al richiedente
    if (data.richiedenteId) {
      body['ts_richiedente@odata.bind'] = `/ts_utentis(${assertGuid(data.richiedenteId)})`;
    }

    // Le chiavi undefined non vanno inviate (Dataverse le interpreterebbe
    // come azzeramenti espliciti su alcune tipologie di colonna)
    const payload = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined)
    );

    const response = await this.request('POST', 'ts_richiestes', payload);
    await this.ensureOk(response, 'Errore creazione richiesta');

    // Estrai ID dalla response header
    const locationHeader = response.headers.get('OData-EntityId');
    if (!locationHeader) {
      throw new DataverseError('ID richiesta non trovato nella response');
    }

    const id = locationHeader.match(/\(([^)]+)\)/)?.[1];
    return id || '';
  }

  /**
   * Recupera tutte le richieste con filtri opzionali
   */
  /**
   * NB: eventuali valori utente dentro `filter` vanno escapati dal chiamante
   * con odataEscape() prima della composizione.
   */
  async getRequests(filter?: string, orderBy = 'ts_data_creazione desc'): Promise<TechnologyRequest[]> {
    const params: string[] = [];

    if (orderBy) {
      params.push(`$orderby=${encodeURIComponent(orderBy)}`);
    }

    if (filter) {
      params.push(`$filter=${encodeURIComponent(filter)}`);
    }

    // Espandi lookup per richiedente
    params.push('$expand=ts_richiedente($select=ts_nome,ts_cognome,ts_email)');

    const path = 'ts_richiestes' + (params.length > 0 ? '?' + params.join('&') : '');

    const response = await this.request('GET', path);
    await this.ensureOk(response, 'Errore recupero richieste');

    const data = await response.json();
    return this.mapDataverseToRequests(data.value);
  }

  /**
   * Recupera una richiesta per ID
   */
  async getRequestById(id: string): Promise<TechnologyRequest | null> {
    const response = await this.request(
      'GET',
      `ts_richiestes(${assertGuid(id)})?$expand=ts_richiedente`
    );

    if (response.status === 404) {
      return null;
    }

    await this.ensureOk(response, 'Errore recupero richiesta');

    const data = await response.json();
    return this.mapDataverseToRequest(data);
  }

  /**
   * Aggiorna una richiesta esistente
   */
  async updateRequest(id: string, updates: Partial<TechnologyRequest>): Promise<void> {
    const body: any = {};

    // Confronti su undefined (non truthy): stringa vuota, false e 0 sono
    // aggiornamenti legittimi che prima venivano scartati in silenzio
    if (updates.statoCorrente !== undefined) body.ts_stato = updates.statoCorrente;
    if (updates.trackAssegnato !== undefined) body.ts_track = updates.trackAssegnato;
    if (updates.nomeApparecchiatura !== undefined) body.ts_nome_apparecchiatura = updates.nomeApparecchiatura;
    if (updates.descrizioneDettagliata !== undefined) body.ts_descrizione = updates.descrizioneDettagliata;
    if (updates.budget?.valoreStimatoEuro !== undefined) body.ts_budget_stimato = updates.budget.valoreStimatoEuro;
    if (updates.motivazioneRichiesta !== undefined) body.ts_motivazione_richiesta = updates.motivazioneRichiesta;

    // Aggiungi sempre data ultima modifica
    body.ts_data_ultima_modifica = new Date().toISOString();

    const response = await this.request('PATCH', `ts_richiestes(${assertGuid(id)})`, body);
    await this.ensureOk(response, 'Errore aggiornamento richiesta');
  }

  /**
   * Elimina una richiesta
   */
  async deleteRequest(id: string): Promise<void> {
    const response = await this.request('DELETE', `ts_richiestes(${assertGuid(id)})`);
    await this.ensureOk(response, 'Errore eliminazione richiesta');
  }

  // ========================================================================
  // UTENTI (ts_utentis)
  // ========================================================================

  /**
   * Recupera utente corrente dal token
   */
  async getCurrentUser(): Promise<User | null> {
    const msal = await ensureMsalInitialized();
    const accounts = msal.getAllAccounts();

    if (accounts.length === 0) {
      return null;
    }

    const account = accounts[0];
    const email = account.username;

    // Cerca utente in Dataverse per email (escapata: un apice nell'email
    // non deve poter alterare il filtro OData)
    const filter = `ts_email eq '${odataEscape(email)}'`;
    const response = await this.request(
      'GET',
      `ts_utentis?$filter=${encodeURIComponent(filter)}`
    );

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
    const [nome, cognome] = (account.name || '').split(' ');

    const body = {
      ts_email: account.username,
      ts_nome: nome || account.username.split('@')[0],
      ts_cognome: cognome || '',
      ts_azure_ad_objectid: account.localAccountId,
      ts_attivo: true,
      ts_ruolo: 'RESPONSABILE_UO', // Ruolo default
    };

    const response = await this.request('POST', 'ts_utentis', body);
    await this.ensureOk(response, 'Errore creazione utente');

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
   * Aggiungi voce audit trail.
   *
   * IMPORTANTE: in caso di fallimento LANCIA (niente best-effort). L'audit
   * trail è un requisito di conformità (tracciabilità DEC/RUP): il chiamante
   * deve scrivere la voce di audit PRIMA di applicare la transizione di stato
   * e considerare la transizione fallita se questa scrittura non riesce.
   */
  async addWorkflowHistory(
    richiestaId: string,
    utenteId: string,
    azione: string,
    statoPrecedente?: string,
    statoNuovo?: string,
    note?: string
  ): Promise<void> {
    const body = {
      'ts_richiesta@odata.bind': `/ts_richiestes(${assertGuid(richiestaId)})`,
      'ts_utente@odata.bind': `/ts_utentis(${assertGuid(utenteId)})`,
      ts_azione: azione,
      ts_stato_precedente: statoPrecedente,
      ts_stato_nuovo: statoNuovo,
      ts_note: note,
      ts_data_azione: new Date().toISOString(),
    };

    const response = await this.request('POST', 'ts_workflow_histories', body);
    await this.ensureOk(response, 'Errore salvataggio audit trail (workflow history)');
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
      richiedeHTARegionale: item.ts_richiede_hta_regionale || false,
      motivazioneAssegnazioneTrack: item.ts_motivazione_assegnazione_track,
      urgenzaSafetyCritica: item.ts_urgenza_safety || false,
      urgenzaBloccoServizio: item.ts_urgenza_blocco_servizio || false,
      urgenzaObbligoNormativo: item.ts_urgenza_obbligo_normativo || false,
      sostituzioneGiaAggiudicata: item.ts_sostituzione_gia_aggiudicata || false,
      // Campi obbligatori del modello non ancora espansi dalla query:
      // inizializzati vuoti per non far fallire i consumatori (workflow,
      // dashboard); lo storico si carica dalla tabella ts_workflow_histories
      allegati: [],
      storico: [],
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
