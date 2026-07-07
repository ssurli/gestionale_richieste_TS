# 📊 Setup Tabelle Microsoft Dataverse

Guida passo-passo per creare le tabelle necessarie nel database Dataverse.

## 🎯 Prerequisiti

- ✅ Licenza Microsoft 365 E3/E5 (o superiore) con Power Platform
- ✅ Accesso a Power Apps portal: https://make.powerapps.com
- ✅ Permessi di amministratore Dataverse

---

## 📋 Tabelle da Creare

1. **ts_utenti** - Utenti del sistema
2. **ts_richieste** - Richieste tecnologie sanitarie
3. **ts_workflow_history** - Audit trail
4. **ts_ordini_estar** - Listino ESTAR
5. **ts_donazioni** - Informazioni donazioni (relazione 1:1 con richieste)

---

## 🚀 Procedura Creazione Tabelle

### Step 1: Accesso Power Apps

```bash
1. Vai su https://make.powerapps.com
2. Login con email aziendale @usltoscananordovest.it
3. Seleziona environment:
   - Development (per test)
   - Production (per go-live)
4. Nel menu laterale: Tables → + New table
```

---

## 📝 Tabella 1: ts_utenti

### Creazione Tabella

```
1. Click "+ New table" → "New table"
2. Display name: Utente Sistema HTA
3. Plural name: Utenti Sistema HTA
4. Primary column:
   - Display name: Email
   - Name: ts_email
5. Enable attachments: No
6. Click "Save"
```

### Colonne da Aggiungere

Dopo aver creato la tabella, aggiungi le seguenti colonne:

| Display Name | Name | Data Type | Required | Description |
|--------------|------|-----------|----------|-------------|
| Email | ts_email | Email | ✅ Yes | Email aziendale |
| Nome | ts_nome | Single line of text | ✅ Yes | Nome utente |
| Cognome | ts_cognome | Single line of text | ✅ Yes | Cognome utente |
| Ruolo | ts_ruolo | Choice | ✅ Yes | Ruolo nel sistema |
| Unità Operativa | ts_unita_operativa | Single line of text | ❌ No | UO di appartenenza |
| Dipartimento | ts_dipartimento | Single line of text | ❌ No | Dipartimento |
| Zona/Distretto | ts_zona_distretto | Single line of text | ❌ No | |
| Telefono | ts_telefono | Phone | ❌ No | |
| Attivo | ts_attivo | Yes/No | ✅ Yes | Default: Yes |
| Azure AD Object ID | ts_azure_ad_objectid | Single line of text | ✅ Yes | ID Entra ID |

**Choice: ts_ruolo** (Valori):
```
RESPONSABILE_UO
DIRETTORE_UOC
DIRETTORE_DIPARTIMENTO
RESPONSABILE_ZONA_DISTRETTO
COORDINATORE_COMMAZ
MEMBRO_COMMAZ
USL_TS
USL_PM
ESTAR_TS
DIREZIONE_SANITARIA
DIREZIONE_AMMINISTRATIVA
ADMIN
```

---

## 📝 Tabella 2: ts_richieste

### Creazione Tabella

```
1. Click "+ New table" → "New table"
2. Display name: Richiesta Tecnologia
3. Plural name: Richieste Tecnologie
4. Primary column:
   - Display name: Numero Progressivo
   - Name: ts_numero_progressivo
5. Click "Save"
```

### Colonne da Aggiungere

#### Identificazione

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Numero Progressivo | ts_numero_progressivo | Single line of text | ✅ Yes |
| Data Creazione | ts_data_creazione | Date and Time | ✅ Yes (auto) |
| Data Ultima Modifica | ts_data_ultima_modifica | Date and Time | ✅ Yes (auto) |

#### Tracking Workflow

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Stato Corrente | ts_stato | Choice | ✅ Yes |
| Track Assegnato | ts_track | Choice | ❌ No |
| Data Assegnazione Track | ts_data_assegnazione_track | Date and Time | ❌ No |
| Giorni Trascorsi | ts_giorni_trascorsi | Whole Number | ❌ No |
| Giorni Residui Track | ts_giorni_residui_track | Whole Number | ❌ No |

**Choice: ts_stato**
```
BOZZA
SOTTOMESSA
IN_TRIAGE
ASSEGNATO_TRACK
IN_VALIDAZIONE_DIPARTIMENTO
IN_PRESCREENING
IN_VALUTAZIONE_COMMAZ
IN_APPROVAZIONE_DS
IN_APPROVAZIONE_DA
APPROVATA
RESPINTA
RINVIATA
IN_ACQUISIZIONE_ESTAR
COMPLETATA
```

**Choice: ts_track**
```
TRACK_1 (Urgenza Critica - 24-48h)
TRACK_2 (Fast Track - 5-7gg)
TRACK_3 (Semplificata - 15-20gg)
TRACK_4 (HTA Completo - 30-45gg)
```

#### Richiedenti e Struttura

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Richiedente | ts_richiedente | Lookup | ✅ Yes |
| Unità Operativa | ts_unita_operativa | Single line of text | ✅ Yes |
| Dipartimento | ts_dipartimento | Single line of text | ✅ Yes |
| Zona/Distretto | ts_zona_distretto | Single line of text | ❌ No |
| Direttore Dipartimento | ts_direttore_dipartimento | Lookup | ❌ No |
| Data Validazione Dipartimento | ts_data_validazione_dipartimento | Date and Time | ❌ No |
| Note Direttore | ts_note_direttore | Multiple lines of text | ❌ No |

**Lookup Configuration:**
- ts_richiedente → Related table: ts_utenti
- ts_direttore_dipartimento → Related table: ts_utenti

#### Tipo e Caratteristiche

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Tipo Acquisto | ts_tipo_acquisto | Choice | ✅ Yes |
| Tipo Apparecchiatura | ts_tipo_apparecchiatura | Choice | ✅ Yes |
| Priorità | ts_priorita | Choice | ❌ No |
| Nome Apparecchiatura | ts_nome_apparecchiatura | Single line of text | ✅ Yes |
| Descrizione | ts_descrizione | Multiple lines of text | ✅ Yes |
| Caratteristiche Tecniche | ts_caratteristiche_tecniche | Multiple lines of text | ❌ No |

**Choice: ts_tipo_acquisto**
```
PROGRAMMATO
NON_PROGRAMMATO
SOSTITUZIONE
DONAZIONE
COMODATO
NOLEGGIO
```

**Choice: ts_tipo_apparecchiatura**
```
GENERALE
ECOGRAFO
DIAGNOSTICA
LABORATORIO
TERAPIA
RIABILITAZIONE
ALTRO
```

**Choice: ts_priorita** (solo per Track 2)
```
A (Massima urgenza)
B (Alta)
C (Media)
```

#### Motivazione

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Motivazione Richiesta | ts_motivazione_richiesta | Multiple lines of text | ✅ Yes |
| Impatto Assistenziale | ts_impatto_assistenziale | Choice | ❌ No |
| Esistono Alternative | ts_esistono_alternative | Yes/No | ❌ No |
| Descrizione Alternative | ts_descrizione_alternative | Multiple lines of text | ❌ No |

**Choice: ts_impatto_assistenziale**
```
CRITICO
ALTO
MEDIO
BASSO
```

#### Sostituzione

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| È Sostituzione | ts_is_sostituzione | Yes/No | ❌ No |
| Apparecchiatura Sostituita | ts_apparecchiatura_sostituita | Single line of text | ❌ No |
| Motivo Sostituzione | ts_motivazione_sostituzione | Choice | ❌ No |
| Dettaglio Motivo | ts_dettaglio_motivo_sostituzione | Multiple lines of text | ❌ No |

**Choice: ts_motivazione_sostituzione**
```
NON_RIPARABILE
OBSOLETO
UPGRADE_OBBLIGATO
ALTRO
```

#### Budget

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Budget Stimato (€) | ts_budget_stimato | Currency | ✅ Yes |
| IVA Esclusa | ts_budget_iva_esclusa | Yes/No | ✅ Yes |
| Fonte Finanziamento | ts_fonte_finanziamento | Choice | ❌ No |
| Dettaglio Fonte | ts_dettaglio_fonte | Single line of text | ❌ No |
| Anno Riferimento | ts_anno_riferimento | Whole Number | ❌ No |
| Capitolo Bilancio | ts_capitolo_bilancio | Single line of text | ❌ No |
| Budget Disponibile | ts_budget_disponibile | Yes/No | ❌ No |
| Importo Disponibile (€) | ts_importo_disponibile | Currency | ❌ No |
| Richiesta Integrazione | ts_richiesta_integrazione | Yes/No | ❌ No |
| Importo Integrazione (€) | ts_importo_integrazione | Currency | ❌ No |

**Choice: ts_fonte_finanziamento**
```
PIANO_INVESTIMENTI
FONDO_INDISTINTO
FONDI_STATALI
DONAZIONE
ALTRO
```

#### Flags

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Richiede Service | ts_richiede_service | Yes/No | ❌ No |
| Richiede Consumabili | ts_richiede_consumabili | Yes/No | ❌ No |
| È Donazione | ts_is_donazione | Yes/No | ❌ No |
| Richiede Adeguamenti | ts_richiede_adeguamenti | Yes/No | ❌ No |
| Descrizione Adeguamenti | ts_descrizione_adeguamenti | Multiple lines of text | ❌ No |
| Studio Fattibilità | ts_studio_fattibilita | Yes/No | ❌ No |

#### Triage e urgenza (colonne aggiunte con il cablaggio persistenza)

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Motivazione Assegnazione Track | ts_motivazione_assegnazione_track | Multiple lines of text | ❌ No |
| Urgenza Safety Critica | ts_urgenza_safety | Yes/No | ❌ No |
| Urgenza Blocco Servizio | ts_urgenza_blocco_servizio | Yes/No | ❌ No |
| Urgenza Obbligo Normativo | ts_urgenza_obbligo_normativo | Yes/No | ❌ No |
| Sostituzione Già Aggiudicata | ts_sostituzione_gia_aggiudicata | Yes/No | ❌ No |

> ⚠️ **ts_numero_progressivo va configurato come Autonumber** (Power Apps →
> colonna → Data type: Autonumber, es. formato `{SEQNUM:4}-{YEAR}`): una
> numerazione generata client-side sarebbe soggetta a duplicati e manipolabile.

---

## 📝 Tabella 3: ts_workflow_history

### Creazione Tabella

```
1. Click "+ New table" → "New table"
2. Display name: Workflow History
3. Plural name: Workflow Histories
4. Primary column:
   - Display name: Azione
   - Name: ts_azione
5. Click "Save"
```

### Colonne

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Richiesta | ts_richiesta | Lookup | ✅ Yes |
| Utente | ts_utente | Lookup | ✅ Yes |
| Azione | ts_azione | Single line of text | ✅ Yes |
| Stato Precedente | ts_stato_precedente | Single line of text | ❌ No |
| Stato Nuovo | ts_stato_nuovo | Single line of text | ✅ Yes |
| Note | ts_note | Multiple lines of text | ❌ No |
| Data Azione | ts_data_azione | Date and Time | ✅ Yes (auto) |

**Lookup Configuration:**
- ts_richiesta → Related table: ts_richieste
- ts_utente → Related table: ts_utenti

---

## 📝 Tabella 4: ts_ordini_estar

### Creazione Tabella

```
1. Click "+ New table" → "New table"
2. Display name: Ordine ESTAR
3. Plural name: Ordini ESTAR
4. Primary column:
   - Display name: Numero Determina
   - Name: ts_numero_determina
5. Click "Save"
```

### Colonne

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Numero Determina | ts_numero_determina | Single line of text | ✅ Yes |
| Oggetto | ts_oggetto | Multiple lines of text | ✅ Yes |
| Categoria | ts_categoria | Single line of text | ❌ No |
| Importo (€) | ts_importo | Currency | ❌ No |
| Data Scadenza | ts_data_scadenza | Date Only | ❌ No |
| Fornitore | ts_fornitore | Single line of text | ❌ No |
| Link ESTAR | ts_link_estar | URL | ❌ No |

---

## 📝 Tabella 5: ts_donazioni

### Creazione Tabella

```
1. Click "+ New table" → "New table"
2. Display name: Donazione
3. Plural name: Donazioni
4. Primary column:
   - Display name: Nome Donatore
   - Name: ts_nome_donatore
5. Click "Save"
```

### Colonne

| Display Name | Name | Data Type | Required |
|--------------|------|-----------|----------|
| Richiesta | ts_richiesta | Lookup | ✅ Yes |
| Nome Donatore | ts_nome_donatore | Single line of text | ❌ No |
| Tipologia Donatore | ts_tipologia_donatore | Choice | ✅ Yes |
| Valore Donazione (€) | ts_valore_donazione | Currency | ✅ Yes |
| Materiali Dedicati | ts_materiali_dedicati | Yes/No | ✅ Yes |
| Conforme DGR 306 | ts_conforme_dgr306 | Yes/No | ✅ Yes |
| Tecnologia Aggiudicata | ts_tecnologia_aggiudicata | Yes/No | ❌ No |
| Numero Det. ESTAR | ts_numero_det_estar | Single line of text | ❌ No |

**Choice: ts_tipologia_donatore**
```
ASSOCIAZIONE
PRIVATO
FONDAZIONE
ALTRO
```

**Lookup Configuration:**
- ts_richiesta → Related table: ts_richieste (Relationship: 1:N)

---

## 🔐 Security Roles (Opzionale)

### Configurare Row-Level Security

```
1. Settings → Security → Security Roles
2. Crea role: "HTA - Responsabile UO"
   - Read: Own (può leggere solo proprie richieste)
   - Create: Organization (può creare per tutta org)
   - Write: Own
   - Delete: None

3. Crea role: "HTA - Coordinatore CommAz"
   - Read: Organization (può leggere tutte)
   - Create: Organization
   - Write: Organization
   - Delete: Own

4. Crea role: "HTA - Direzione"
   - Read: Organization
   - Create: None
   - Write: Organization (approvazioni)
   - Delete: None

5. Assegna roles agli utenti:
   Settings → Users → Select user → Manage Roles
```

---

## ✅ Verifica Setup

### Checklist Finale

```bash
[ ] Tabella ts_utenti creata con tutti i campi
[ ] Tabella ts_richieste creata con tutti i campi
[ ] Tabella ts_workflow_history creata
[ ] Tabella ts_ordini_estar creata
[ ] Tabella ts_donazioni creata
[ ] Tutte le Choice configurate correttamente
[ ] Tutti i Lookup configurati
[ ] Security roles configurati (opzionale)
```

### Test Creazione Record

```
1. Vai su Power Apps → Tables → ts_utenti
2. Click "+ New row"
3. Compila:
   - Email: test@usltoscananordovest.it
   - Nome: Test
   - Cognome: Utente
   - Ruolo: RESPONSABILE_UO
   - Attivo: Yes
   - Azure AD Object ID: test-123
4. Click "Save & Close"
5. Verifica che il record appaia nella lista
```

---

## 📊 Import Dati Iniziali

### Importare 88 Ordini ESTAR

```
1. Prepara file Excel con colonne:
   - ts_numero_determina
   - ts_oggetto
   - ts_categoria
   - ts_importo
   - ts_fornitore
   - ts_link_estar

2. Power Apps → Tables → ts_ordini_estar
3. Click "Import" → "Import data from Excel"
4. Upload file
5. Map columns
6. Import

Oppure usa Power Automate flow per import automatico
```

---

## 🔄 Backup e Export

### Configurare Backup Automatico

```
Dataverse fa backup automatici ogni 24h (retention 28 giorni)

Per export manuale:
1. Power Platform Admin Center
2. Environments → {tuo environment}
3. Backups → Create → Create backup
4. Download .zip quando pronto
```

---

## 📞 Supporto

**Documentazione Microsoft:**
- [Create tables in Dataverse](https://docs.microsoft.com/power-apps/maker/data-platform/create-edit-entities-portal)
- [Dataverse Web API](https://docs.microsoft.com/power-apps/developer/data-platform/webapi/overview)
- [Security roles](https://docs.microsoft.com/power-platform/admin/security-roles-privileges)

**In caso di problemi:**
- Check che hai licenza Power Platform attiva
- Verifica permessi amministratore Dataverse
- Consulta Microsoft Support (incluso in M365 E3/E5)

---

**Setup completato! 🎉**

Ora puoi procedere con la configurazione frontend (.env.local) e deployment Azure Static Web Apps.
