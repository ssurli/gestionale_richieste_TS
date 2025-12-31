# 🚀 Deployment Produzione: Next.js + Power Platform

**Architettura finale per USL Toscana Nord Ovest**

## 📋 Panoramica

Soluzione ibrida che combina:
- ✅ **Frontend Next.js** (già sviluppato) - UI professionale
- ✅ **Microsoft Dataverse** (incluso M365) - Database gratis
- ✅ **Power Automate** (incluso M365) - Workflow approvazioni
- ✅ **Entra ID** (ex Azure AD) - SSO automatico
- ✅ **Azure Static Web Apps** - Hosting frontend (€8/mese)

**Costo totale: €8-10/mese** (solo hosting frontend)

---

## 🏗️ Architettura Tecnica

```
┌─────────────────────────────────────────────────────────────┐
│                    UTENTI USL                                │
│          (SSO con email @usltoscananordovest.it)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           FRONTEND - Next.js 14 + TypeScript                 │
│         (Azure Static Web Apps - €8/mese)                    │
│  • Landing page con 4 Track                                  │
│  • Form Fast Track / Semplificato / HTA Completo            │
│  • Dashboard richieste                                       │
│  • Listino ESTAR integrato                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS + MSAL.js Auth
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        MICROSOFT ENTRA ID (ex Azure AD)                      │
│              (GRATIS - incluso M365)                         │
│  • Single Sign-On (SSO)                                      │
│  • Ruoli: Responsabile UO, Coordinatore CommAz, etc.        │
│  • Conditional Access già configurato                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          MICROSOFT DATAVERSE (Database)                      │
│              (GRATIS - incluso Power Platform)               │
│                                                              │
│  Tabelle:                                                    │
│  • ts_richieste (TechnologyRequest)                         │
│  • ts_utenti (User)                                         │
│  • ts_workflow_history (audit trail)                        │
│  • ts_ordini_estar (Listino ESTAR)                         │
│  • ts_allegati (PDF, immagini)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Trigger automatici
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           POWER AUTOMATE (Workflow)                          │
│              (GRATIS - incluso Power Platform)               │
│                                                              │
│  Flows:                                                      │
│  1. Nuova richiesta → Notifica Direttore Dipartimento       │
│  2. Approvazione → Notifica Coordinatore CommAz             │
│  3. Assegnazione Track → Notifica richiedente               │
│  4. Scadenza tempi → Alert automatico                       │
│  5. Approvazione finale → Email + Teams notification        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         MICROSOFT 365 (Notifiche)                           │
│  • Teams: Messaggi in canale "Gestionale HTA"               │
│  • Outlook: Email automatiche                               │
│  • SharePoint: Documenti allegati (opzionale)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Schema Database Dataverse

### Tabella: `ts_richieste` (Richieste Tecnologie)

| Nome Campo | Tipo | Obbligatorio | Descrizione |
|------------|------|--------------|-------------|
| `ts_richiestaid` | GUID | ✅ | ID univoco (PK) |
| `ts_numero_progressivo` | Text | ✅ | Es: 2025-001 |
| `ts_nome_apparecchiatura` | Text | ✅ | Nome tecnologia |
| `ts_descrizione` | Multiline Text | ✅ | Descrizione dettagliata |
| `ts_track` | Choice | ✅ | TRACK_1 / TRACK_2 / TRACK_3 / TRACK_4 |
| `ts_stato` | Choice | ✅ | BOZZA / SOTTOMESSA / IN_TRIAGE / etc. |
| `ts_tipo_acquisto` | Choice | ✅ | PROGRAMMATO / SOSTITUZIONE / DONAZIONE |
| `ts_unita_operativa` | Text | ✅ | Nome UO |
| `ts_dipartimento` | Text | ✅ | Nome dipartimento |
| `ts_budget_stimato` | Currency | ✅ | Valore in euro |
| `ts_richiedente` | Lookup | ✅ | → ts_utenti |
| `ts_direttore_dipartimento` | Lookup | | → ts_utenti |
| `ts_data_creazione` | DateTime | ✅ | Auto |
| `ts_data_ultima_modifica` | DateTime | ✅ | Auto |
| `ts_giorni_trascorsi` | Whole Number | | Calcolato |
| `ts_motivazione_richiesta` | Multiline Text | ✅ | |
| `ts_impatto_assistenziale` | Choice | | CRITICO/ALTO/MEDIO/BASSO |
| `ts_priorita` | Choice | | A / B / C (solo Track 2) |

**Scelte (Choices):**

```xml
ts_track:
  - TRACK_1 (Urgenza Critica - 24-48h)
  - TRACK_2 (Fast Track - 5-7gg)
  - TRACK_3 (Semplificata - 15-20gg)
  - TRACK_4 (HTA Completo - 30-45gg)

ts_stato:
  - BOZZA
  - SOTTOMESSA
  - IN_TRIAGE
  - ASSEGNATO_TRACK
  - IN_VALIDAZIONE_DIPARTIMENTO
  - IN_PRESCREENING
  - IN_VALUTAZIONE_COMMAZ
  - IN_APPROVAZIONE_DS
  - IN_APPROVAZIONE_DA
  - APPROVATA
  - RESPINTA
  - COMPLETATA

ts_tipo_acquisto:
  - PROGRAMMATO
  - NON_PROGRAMMATO
  - SOSTITUZIONE
  - DONAZIONE
  - COMODATO
  - NOLEGGIO
```

### Tabella: `ts_utenti` (Utenti Sistema)

| Nome Campo | Tipo | Obbligatorio | Descrizione |
|------------|------|--------------|-------------|
| `ts_utenteid` | GUID | ✅ | ID univoco (PK) |
| `ts_email` | Email | ✅ | email@usltoscananordovest.it |
| `ts_nome` | Text | ✅ | Nome |
| `ts_cognome` | Text | ✅ | Cognome |
| `ts_ruolo` | Choice | ✅ | Ruolo nel sistema |
| `ts_unita_operativa` | Text | | UO di appartenenza |
| `ts_dipartimento` | Text | | Dipartimento |
| `ts_telefono` | Text | | Telefono |
| `ts_attivo` | Two Options | ✅ | Sì/No |
| `ts_azure_ad_objectid` | Text | ✅ | ID Entra ID (SSO) |

**Scelte ruoli:**
```
RESPONSABILE_UO
DIRETTORE_UOC
DIRETTORE_DIPARTIMENTO
COORDINATORE_COMMAZ
MEMBRO_COMMAZ
USL_TS
DIREZIONE_SANITARIA
DIREZIONE_AMMINISTRATIVA
ADMIN
```

### Tabella: `ts_workflow_history` (Audit Trail)

| Nome Campo | Tipo | Obbligatorio | Descrizione |
|------------|------|--------------|-------------|
| `ts_workflow_historyid` | GUID | ✅ | ID univoco (PK) |
| `ts_richiesta` | Lookup | ✅ | → ts_richieste |
| `ts_utente` | Lookup | ✅ | → ts_utenti |
| `ts_azione` | Text | ✅ | CREATA / APPROVATA / RESPINTA |
| `ts_stato_precedente` | Text | | |
| `ts_stato_nuovo` | Text | ✅ | |
| `ts_note` | Multiline Text | | |
| `ts_data_azione` | DateTime | ✅ | Auto |

### Tabella: `ts_ordini_estar` (Listino ESTAR)

| Nome Campo | Tipo | Obbligatorio | Descrizione |
|------------|------|--------------|-------------|
| `ts_ordine_estarid` | GUID | ✅ | ID univoco (PK) |
| `ts_numero_determina` | Text | ✅ | Es: Det. 1446/2024 |
| `ts_oggetto` | Text | ✅ | Descrizione gara |
| `ts_categoria` | Text | | |
| `ts_importo` | Currency | | |
| `ts_data_scadenza` | Date | | |
| `ts_fornitore` | Text | | |
| `ts_link_estar` | URL | | |

### Tabella: `ts_donazioni` (Info Donazioni)

| Nome Campo | Tipo | Obbligatorio | Descrizione |
|------------|------|--------------|-------------|
| `ts_donazioneid` | GUID | ✅ | ID univoco (PK) |
| `ts_richiesta` | Lookup | ✅ | → ts_richieste |
| `ts_nome_donatore` | Text | | |
| `ts_tipologia_donatore` | Choice | ✅ | ASSOCIAZIONE/PRIVATO/FONDAZIONE |
| `ts_valore_donazione` | Currency | ✅ | |
| `ts_materiali_dedicati` | Two Options | ✅ | DGR 306/2024 |
| `ts_conforme_dgr306` | Two Options | ✅ | Auto-calcolato |
| `ts_tecnologia_aggiudicata` | Two Options | | |
| `ts_numero_det_estar` | Text | | |

---

## 🔐 Setup Autenticazione (MSAL.js)

### 1. Registrazione App su Entra ID

```bash
# Nel portale Azure (https://portal.azure.com)
1. Azure Active Directory → App registrations → New registration
2. Nome: "Gestionale HTA USL TNO"
3. Supported account types: "Single tenant"
4. Redirect URI:
   - Type: Single-page application (SPA)
   - URI: https://hta.usltoscananordovest.it
5. Crea applicazione
6. Copia:
   - Application (client) ID
   - Directory (tenant) ID
```

### 2. Permessi API Dataverse

```bash
# Nella app registration → API permissions
1. Add permission → Dynamics CRM → Delegated permissions
2. Seleziona: user_impersonation
3. Grant admin consent ✅
```

### 3. Configurazione Frontend Next.js

**File: `.env.local`**
```bash
# Entra ID
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AZURE_AD_TENANT_ID=your-tenant-id-here
NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=https://hta.usltoscananordovest.it

# Dataverse
NEXT_PUBLIC_DATAVERSE_URL=https://yourorg.crm4.dynamics.com
NEXT_PUBLIC_DATAVERSE_API_VERSION=v9.2
```

**File: `src/lib/msalConfig.ts`**
```typescript
import { Configuration, PublicClientApplication } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    `${process.env.NEXT_PUBLIC_DATAVERSE_URL}//user_impersonation`,
  ],
};

export const msalInstance = new PublicClientApplication(msalConfig);
```

**File: `src/lib/dataverseClient.ts`**
```typescript
import { msalInstance, loginRequest } from './msalConfig';

const DATAVERSE_URL = process.env.NEXT_PUBLIC_DATAVERSE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_DATAVERSE_API_VERSION;

export class DataverseClient {
  private async getAccessToken(): Promise<string> {
    const account = msalInstance.getAllAccounts()[0];

    if (!account) {
      throw new Error('No user logged in');
    }

    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });

    return response.accessToken;
  }

  async createRequest(data: Partial<TechnologyRequest>): Promise<string> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ts_numero_progressivo: data.numeroProgressivo,
          ts_nome_apparecchiatura: data.nomeApparecchiatura,
          ts_descrizione: data.descrizioneDettagliata,
          ts_track: data.trackAssegnato,
          ts_stato: data.statoCorrente,
          ts_tipo_acquisto: data.tipoAcquisto,
          ts_unita_operativa: data.unitaOperativa,
          ts_dipartimento: data.dipartimento,
          ts_budget_stimato: data.budget.valoreStimatoEuro,
          ts_motivazione_richiesta: data.motivazioneRichiesta,
          // ... altri campi
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Dataverse error: ${response.statusText}`);
    }

    const locationHeader = response.headers.get('OData-EntityId');
    const id = locationHeader?.split('(')[1].split(')')[0];

    return id!;
  }

  async getRequests(filter?: string): Promise<TechnologyRequest[]> {
    const token = await this.getAccessToken();

    let url = `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes?$orderby=ts_data_creazione desc`;
    if (filter) {
      url += `&$filter=${filter}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Dataverse error: ${response.statusText}`);
    }

    const data = await response.json();
    return this.mapDataverseToRequest(data.value);
  }

  async updateRequest(id: string, updates: Partial<TechnologyRequest>): Promise<void> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes(${id})`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0',
        },
        body: JSON.stringify({
          ts_stato: updates.statoCorrente,
          ts_data_ultima_modifica: new Date().toISOString(),
          // ... altri campi
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Dataverse error: ${response.statusText}`);
    }
  }

  async deleteRequest(id: string): Promise<void> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${DATAVERSE_URL}/api/data/${API_VERSION}/ts_richiestes(${id})`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Dataverse error: ${response.statusText}`);
    }
  }

  private mapDataverseToRequest(dataverseData: any[]): TechnologyRequest[] {
    return dataverseData.map(item => ({
      id: item.ts_richiestaid,
      numeroProgressivo: item.ts_numero_progressivo,
      nomeApparecchiatura: item.ts_nome_apparecchiatura,
      descrizioneDettagliata: item.ts_descrizione,
      trackAssegnato: item.ts_track,
      statoCorrente: item.ts_stato,
      tipoAcquisto: item.ts_tipo_acquisto,
      unitaOperativa: item.ts_unita_operativa,
      dipartimento: item.ts_dipartimento,
      dataCreazione: new Date(item.ts_data_creazione),
      dataUltimaModifica: new Date(item.ts_data_ultima_modifica),
      // ... mappare altri campi
    }));
  }
}

export const dataverseClient = new DataverseClient();
```

---

## 🔄 Power Automate Flows

### Flow 1: Nuova Richiesta → Notifica Direttore

**Trigger:** When a row is added (ts_richieste)

**Actions:**
1. Get user (ts_richiedente lookup)
2. Get direttore dipartimento (based on ts_dipartimento)
3. Send email (Outlook)
   - To: {direttore.email}
   - Subject: "Nuova richiesta HTA da validare - {ts_numero_progressivo}"
   - Body: Template con dettagli richiesta
4. Post message in Teams
   - Team: "Gestionale HTA"
   - Channel: "Notifiche"
   - Message: "📋 Nuova richiesta {ts_numero_progressivo} da {richiedente.nome}"

### Flow 2: Approvazione Dipartimento → Triage CommAz

**Trigger:** When a row is modified (ts_richieste)
**Condition:** ts_stato = "IN_TRIAGE"

**Actions:**
1. Get coordinatore CommAz (ruolo = COORDINATORE_COMMAZ)
2. Send email notification
3. Create task in Planner (opzionale)
4. Post in Teams

### Flow 3: Assegnazione Track → Update Dates

**Trigger:** When a row is modified (ts_richieste)
**Condition:** ts_track is not empty AND ts_data_assegnazione_track is empty

**Actions:**
1. Update row:
   - ts_data_assegnazione_track = Now()
   - ts_giorni_residui_track = Calculate based on track type
2. Send confirmation email to richiedente

### Flow 4: Alert Scadenze (Scheduled)

**Trigger:** Recurrence (daily at 9:00 AM)

**Actions:**
1. List rows (ts_richieste) where:
   - ts_stato NOT IN (APPROVATA, RESPINTA, COMPLETATA)
   - ts_giorni_trascorsi >= ts_giorni_massimi_track - 3 (alert 3 giorni prima)
2. For each richiesta in ritardo:
   - Send email to responsabile corrente
   - Post in Teams
   - Update ts_alert_scadenza = true

### Flow 5: Approvazione Finale → Chiusura

**Trigger:** When a row is modified (ts_richieste)
**Condition:** ts_stato = "APPROVATA"

**Actions:**
1. Create PDF report (Word template)
2. Save to SharePoint "Richieste Approvate 2025"
3. Send summary email to richiedente + direzione
4. Post in Teams with 🎉 celebration
5. Create entry in audit table (ts_workflow_history)

---

## 📦 Installazione e Deployment

### Step 1: Setup Dataverse (Power Apps Portal)

```bash
1. Vai a https://make.powerapps.com
2. Seleziona environment (Production o crea nuovo)
3. Tables → New table → Crea ts_richieste
4. Aggiungi tutti i campi come da schema sopra
5. Ripeti per ts_utenti, ts_workflow_history, etc.
6. Salva e pubblica
```

### Step 2: Configurazione Frontend

```bash
# Install dependencies
npm install @azure/msal-browser @azure/msal-react

# Create .env.local con credenziali Entra ID + Dataverse

# Update components to use dataverseClient
```

### Step 3: Deploy su Azure Static Web Apps

```bash
# 1. Crea risorsa Azure Static Web Apps
az staticwebapp create \
  --name gestionale-hta-usltno \
  --resource-group rg-gestionale-hta \
  --location westeurope \
  --sku Free

# 2. Collega a GitHub repository
# Segui wizard nel portale Azure

# 3. Azure creerà automaticamente GitHub Action per deploy

# 4. Ogni push su main → deploy automatico
```

### Step 4: Configurazione Dominio Personalizzato

```bash
# Nel portale Azure Static Web Apps
1. Custom domains → Add
2. Domain name: hta.usltoscananordovest.it
3. Validation type: TXT record
4. Aggiungi TXT record nel DNS USL
5. Validate
6. Azure provvede automaticamente certificato SSL
```

### Step 5: Creazione Power Automate Flows

```bash
1. Vai a https://make.powerautomate.com
2. Create → Automated cloud flow
3. Trigger: "When a row is added or modified" (Dataverse)
4. Table: ts_richieste
5. Aggiungi actions come da template sopra
6. Test e Save
7. Ripeti per tutti i 5 flows
```

---

## 🧪 Testing

### Test 1: Autenticazione SSO

```typescript
// Test login
async function testLogin() {
  await msalInstance.loginPopup(loginRequest);
  const accounts = msalInstance.getAllAccounts();
  console.log('Logged in as:', accounts[0].username);
}
```

### Test 2: Create Request

```typescript
// Test creazione richiesta
const testRequest = {
  numeroProgressivo: '2025-TEST-001',
  nomeApparecchiatura: 'Ecografo Test',
  descrizioneDettagliata: 'Test integrazione Dataverse',
  trackAssegnato: 'TRACK_2',
  statoCorrente: 'BOZZA',
  tipoAcquisto: 'PROGRAMMATO',
  unitaOperativa: 'Cardiologia',
  dipartimento: 'Medicina',
  budget: { valoreStimatoEuro: 25000, ivaEsclusa: true },
  motivazioneRichiesta: 'Test',
};

const id = await dataverseClient.createRequest(testRequest);
console.log('Created with ID:', id);
```

### Test 3: Workflow Email

```bash
1. Crea richiesta da UI
2. Verifica email ricevuta da direttore dipartimento
3. Verifica messaggio Teams nel canale
4. Check audit log in ts_workflow_history
```

---

## 📊 Monitoraggio e Analytics

### Power BI Dashboard (Opzionale)

```bash
# Connetti Power BI a Dataverse
1. Power BI Desktop → Get Data → Dataverse
2. Connetti a ts_richieste table
3. Crea report:
   - Richieste per Track (grafico a torta)
   - Timeline richieste (grafico linea)
   - Tempo medio approvazione per track
   - Top 10 UU.OO. richiedenti
   - Budget allocato vs disponibile
4. Pubblica su Power BI Service
5. Condividi con Direzione USL
```

### Application Insights (per frontend)

```bash
# In Azure Static Web Apps → Settings → Application Insights
1. Enable Application Insights
2. Monitora:
   - Page views
   - User sessions
   - API call performance
   - Errori JavaScript
```

---

## 🔒 Sicurezza

### Security Best Practices

```typescript
// 1. Row-level security in Dataverse
// Ogni utente vede solo richieste del proprio dipartimento
// (configurabile in Power Apps portal)

// 2. HTTPS only
// Azure Static Web Apps forza HTTPS automaticamente

// 3. Token expiration
// MSAL gestisce refresh token automaticamente

// 4. Audit trail completo
// Ogni modifica registrata in ts_workflow_history

// 5. Backup automatici
// Dataverse fa backup giornalieri automatici (retention 28 giorni)
```

---

## 💰 Stima Costi Finale

| Servizio | Tier | Costo/mese | Note |
|----------|------|------------|------|
| **Dataverse** | Incluso M365 | €0 | ✅ Già pagato |
| **Power Automate** | Incluso M365 | €0 | ✅ Già pagato |
| **Entra ID** | Incluso M365 | €0 | ✅ Già pagato |
| **Azure Static Web Apps** | Standard | €8 | Solo hosting frontend |
| **Application Insights** | Basic | €5 | Opzionale (monitoring) |
| **TOTALE** | | **€8-13/mese** | |

**Costo annuale: €96-156** (vs €30.000+ server on-premise)

---

## 📅 Timeline Deployment

### Settimana 1: Setup Infrastruttura
- [ ] Registrazione App su Entra ID
- [ ] Creazione tabelle Dataverse
- [ ] Setup Azure Static Web Apps
- [ ] Configurazione dominio DNS

### Settimana 2: Sviluppo Integrazione
- [ ] Implementazione MSAL authentication
- [ ] DataverseClient completato
- [ ] Migrazione dati demo
- [ ] Testing CRUD operations

### Settimana 3: Power Automate Flows
- [ ] Flow 1: Nuova richiesta
- [ ] Flow 2: Approvazioni
- [ ] Flow 3: Tracking scadenze
- [ ] Flow 4: Notifiche Teams
- [ ] Testing end-to-end workflow

### Settimana 4: Testing e Go-Live
- [ ] User acceptance testing (UAT)
- [ ] Formazione utenti pilota (2-3 UU.OO.)
- [ ] Fix bug e ottimizzazioni
- [ ] Deploy produzione
- [ ] Monitoraggio settimana 1

**Go-Live: Gennaio 2025 (Fase Pilota)**

---

## 📞 Supporto

### Contatti
- **IT USL**: supporto.it@usltoscananordovest.it
- **Microsoft Support**: Incluso in M365 E3/E5
- **Documentazione**: https://docs.microsoft.com/power-platform

### Risorse Utili
- [Dataverse Web API Reference](https://docs.microsoft.com/power-apps/developer/data-platform/webapi/overview)
- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Power Automate Templates](https://make.powerautomate.com/templates)
- [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)

---

**Sistema pronto per produzione! 🚀**
