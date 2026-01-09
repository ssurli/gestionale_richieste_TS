# ✅ Prossimi Passi - Deployment Produzione

Sistema pronto per il deployment! Ecco cosa fare ora.

---

## 📋 Recap: Cosa Abbiamo Fatto

✅ Sviluppato frontend Next.js completo (4 Track HTA)
✅ Allineato con Regolamento Terranova (Allegati 2, 3)
✅ Presentazione alla Direzione completata
✅ Licenza Power Platform confermata attiva
✅ Integrazione MSAL + Dataverse implementata
✅ Documentazione completa creata

---

## 🚀 Deployment: 3 Fasi

### **Fase 1: Setup Azure (1-2 giorni)** ⏱️

**Obiettivo:** Registrare app su Entra ID e configurare autenticazione

#### 1.1 Registra App su Entra ID

```bash
1. Vai su https://portal.azure.com
2. Azure Active Directory → App registrations
3. Click "+ New registration"
4. Compila:
   - Name: Gestionale HTA USL Toscana Nord Ovest
   - Supported account types: Single tenant
   - Redirect URI:
     * Type: Single-page application (SPA)
     * URI: http://localhost:3000 (per dev)
5. Click "Register"
6. **COPIA E SALVA:**
   - Application (client) ID: _______________
   - Directory (tenant) ID: _______________
```

#### 1.2 Configura Permessi API

```bash
1. Nella app registration → API permissions
2. Click "+ Add a permission"
3. Seleziona "Dynamics CRM"
4. Delegated permissions → user_impersonation ✅
5. Click "Add permissions"
6. Click "Grant admin consent for {organization}" ✅
```

#### 1.3 Aggiungi Redirect URIs

```bash
1. Nella app registration → Authentication
2. Under "Single-page application":
   - Add URI: http://localhost:3000
   - Add URI: https://hta.usltoscananordovest.it (quando pronto)
3. Under "Advanced settings":
   - Allow public client flows: No
4. Click "Save"
```

---

### **Fase 2: Setup Dataverse (2-3 giorni)** ⏱️

**Obiettivo:** Creare database e tabelle su Dataverse

#### 2.1 Accedi a Power Apps

```bash
1. Vai su https://make.powerapps.com
2. Login con email @usltoscananordovest.it
3. Seleziona environment:
   - Se non esiste: Create → New environment → "HTA Production"
   - Altrimenti usa environment esistente
```

#### 2.2 Crea Tabelle Dataverse

**Segui la guida completa:** `SETUP_DATAVERSE_TABLES.md`

```bash
Crea nell'ordine:
[ ] 1. ts_utenti (Utenti Sistema)
[ ] 2. ts_richieste (Richieste Tecnologie) - PRINCIPALE
[ ] 3. ts_workflow_history (Audit Trail)
[ ] 4. ts_ordini_estar (Listino ESTAR - 88 ordini)
[ ] 5. ts_donazioni (Info Donazioni)

Tempo stimato: 2-3 ore
```

#### 2.3 Verifica URL Dataverse

```bash
1. Power Apps → Settings (ingranaggio) → Session details
2. **COPIA E SALVA:**
   - Instance url: https://________.crm4.dynamics.com
```

---

### **Fase 3: Configurazione Frontend (1 giorno)** ⏱️

**Obiettivo:** Collegare frontend a Dataverse

#### 3.1 Configura Variabili Ambiente

```bash
1. Nella root del progetto:
   cp .env.example .env.local

2. Apri .env.local e compila:

NEXT_PUBLIC_AZURE_AD_CLIENT_ID=<client-id-copiato-fase-1>
NEXT_PUBLIC_AZURE_AD_TENANT_ID=<tenant-id-copiato-fase-1>
NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=http://localhost:3000

NEXT_PUBLIC_DATAVERSE_URL=<instance-url-copiato-fase-2>
NEXT_PUBLIC_DATAVERSE_API_VERSION=v9.2

3. **NON committare .env.local su git!**
```

#### 3.2 Test Locale

```bash
# Installa dipendenze (già fatto)
npm install

# Avvia dev server
npm run dev

# Apri browser
http://localhost:3000

# Test:
1. Click "Accedi con Microsoft"
2. Login con email @usltoscananordovest.it
3. Verifica che appare nome utente
4. Crea richiesta di test
5. Verifica che appare in Dataverse (Power Apps → Data → Tables → ts_richieste)
```

#### 3.3 Integra AuthProvider nel Layout

**File da modificare:** `src/app/layout.tsx`

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

#### 3.4 Aggiungi LoginButton alla Navbar

**Esempio:**

```typescript
import { LoginButton } from '@/components/auth/LoginButton';

export default function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1>Gestionale HTA</h1>
        <LoginButton />
      </div>
    </nav>
  );
}
```

---

## 🌐 Deployment Azure (Opzionale - 2 giorni)

### Opzione A: Vercel (attuale - FREE)

✅ **Già configurato**
✅ Deploy automatico da GitHub
⚠️ Limitazione: Dataverse già su cloud Microsoft, frontend su Vercel

### Opzione B: Azure Static Web Apps (consigliato - €8/mese)

**Perché Azure:**
- ✅ Stesso ecosistema Microsoft
- ✅ Integrazione nativa con Entra ID
- ✅ Datacenter EU (Milano)
- ✅ Supporto enterprise incluso

**Setup:**

```bash
1. Azure Portal → Create resource → Static Web Apps
2. Compila:
   - Name: gestionale-hta-usltno
   - Region: West Europe
   - Source: GitHub
   - Repository: ssurli/gestionale_richieste_TS
   - Branch: main
   - Build preset: Next.js
3. Click "Review + create"
4. Azure crea GitHub Action automaticamente
5. Ogni push su main → deploy automatico
```

**Configurare variabili ambiente su Azure:**

```bash
1. Azure Static Web Apps → Configuration → Environment variables
2. Aggiungi:
   - NEXT_PUBLIC_AZURE_AD_CLIENT_ID
   - NEXT_PUBLIC_AZURE_AD_TENANT_ID
   - NEXT_PUBLIC_AZURE_AD_REDIRECT_URI (usa URL Azure)
   - NEXT_PUBLIC_DATAVERSE_URL
   - NEXT_PUBLIC_DATAVERSE_API_VERSION
```

**Configurare dominio personalizzato:**

```bash
1. Azure Static Web Apps → Custom domains
2. Click "+ Add"
3. Domain name: hta.usltoscananordovest.it
4. Azure fornirà record DNS da aggiungere
5. Contatta IT USL per aggiungere record DNS
6. Azure provvederà SSL certificate automaticamente
```

---

## 🔄 Power Automate Flows (Opzionale - 1-2 giorni)

Crea workflow automatici per notifiche email/Teams.

```bash
1. Vai su https://make.powerautomate.com
2. Create → Automated cloud flow
3. Trigger: "When a row is added or modified" (Dataverse)
4. Table: ts_richieste
5. Condition: ts_stato = "SOTTOMESSA"
6. Action: Send an email (Outlook)
   - To: Get direttore email from lookup
   - Subject: "Nuova richiesta HTA da validare"
7. Save e Test
```

**Flows raccomandati:**
1. ✅ Nuova richiesta → Email a Direttore Dipartimento
2. ✅ Approvazione → Email a Coordinatore CommAz
3. ✅ Assegnazione Track → Email a richiedente
4. ✅ Scadenza tempi → Alert (daily scheduled)
5. ✅ Approvazione finale → Email + Teams message

---

## 📊 Migrazione Dati Demo (Opzionale)

Se vuoi popolare con dati di test:

```bash
1. Power Apps → Tables → ts_ordini_estar
2. Prepara Excel con 88 ordini ESTAR
3. Import → Import from Excel
4. Map columns
5. Import

Oppure usa API Dataverse per import programmatico
```

---

## ✅ Checklist Go-Live

### Setup Infrastruttura
```
[ ] App registration Entra ID creata
[ ] Permessi API Dataverse configurati
[ ] Tabelle Dataverse create (5 tabelle)
[ ] .env.local configurato correttamente
[ ] Test login locale funzionante
[ ] Test creazione richiesta funzionante
```

### Deployment
```
[ ] Frontend deployato (Vercel o Azure Static Web Apps)
[ ] Variabili ambiente produzione configurate
[ ] Dominio personalizzato configurato (opzionale)
[ ] SSL certificate attivo
[ ] Redirect URIs aggiornati in Entra ID
```

### Workflow (Opzionale)
```
[ ] Power Automate flows creati
[ ] Email notifications configurate
[ ] Teams notifications configurate (opzionale)
```

### Utenti
```
[ ] Utenti pilota creati in ts_utenti
[ ] Security roles assegnati (opzionale)
[ ] Formazione utenti pianificata
```

### Testing
```
[ ] Test login SSO con email aziendale
[ ] Test creazione richiesta Track 2
[ ] Test creazione richiesta Track 3
[ ] Test workflow approvazioni
[ ] Test email notifications
[ ] Test Dashboard visualizzazione
[ ] Test Listino ESTAR
```

---

## 🎯 Timeline Consigliata

| Settimana | Attività | Owner |
|-----------|----------|-------|
| **1** | Setup Azure + Dataverse | IT USL + Dev |
| **2** | Configurazione frontend + Test | Dev |
| **3** | Power Automate flows + Integration test | Dev + Power User |
| **4** | UAT con utenti pilota (2-3 UU.OO.) | Direzione + Utenti |
| **5** | Fix bug + ottimizzazioni | Dev |
| **6** | **GO-LIVE Produzione** | Tutti |

**Data Go-Live stimata:** Metà Gennaio 2025 (4-6 settimane)

---

## 📞 Contatti e Supporto

### Microsoft Support
- Incluso in licenza M365 E3/E5
- Portal: https://admin.microsoft.com/AdminPortal/Home#/support

### Documentazione
- ✅ `DEPLOYMENT_POWER_PLATFORM.md` - Architettura completa
- ✅ `SETUP_DATAVERSE_TABLES.md` - Setup database passo-passo
- ✅ `WORKFLOW.md` - Documentazione workflow sistema
- ✅ `README.md` - Overview generale progetto

### Repository
- GitHub: https://github.com/ssurli/gestionale_richieste_TS
- Branch produzione: `main`
- Branch sviluppo: `claude/healthcare-request-manager-YayUk`

---

## 🎉 Conclusione

**Tutto pronto per il deployment in produzione!**

I file di integrazione sono stati creati:
- ✅ `src/lib/msalConfig.ts` - Configurazione autenticazione
- ✅ `src/lib/dataverseClient.ts` - Client API Dataverse
- ✅ `src/contexts/AuthContext.tsx` - Context React auth
- ✅ `src/components/auth/LoginButton.tsx` - Componente login
- ✅ `.env.example` - Template configurazione

**Prossima azione immediata:**
1. Registra app su Entra ID (Fase 1.1)
2. Crea tabelle Dataverse (Fase 2.2)
3. Configura .env.local (Fase 3.1)
4. Test locale (Fase 3.2)

**Domande? Dubbi?** Chiedi pure! 🚀
