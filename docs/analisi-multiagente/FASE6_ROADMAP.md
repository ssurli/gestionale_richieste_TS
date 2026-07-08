# FASE 6 — Sintesi, Roadmap e Backlog di PR

> Esito dell'analisi multi-agente del 2026-07-07 sul repo `ssurli/gestionale_richieste_TS`.
> Output delle fasi precedenti (JSON) in questa stessa cartella:
> `fase1_orchestratore.json` (mappa), `fase2_audit.json` (28 finding tecnici),
> `fase3_sharepoint.json` (integrazione documentale), `fase4_conformita.json` (23 requisiti),
> `fase5_dominio.json` (13 gap dominio, 5 migliorie UX, 5 KPI).

---

## 1. Quadro consolidato (deduplica e conflitti risolti)

### 1.1 Il fatto che cambia le priorità

**Il sistema oggi è un prototipo UI non cablato, non un gestionale in esercizio** (confermato da Fase 2, 4 e 5 in modo indipendente):

- Nessun form persiste dati: tutti gli `handleSubmit` terminano in `console.log`/`alert`
  (`FormMOD01.tsx:109-112`, `FormMOD02.tsx:189-192`, `FormFastTrack.tsx:92-94`,
  `FormSemplificato.tsx:130-140`, `RequestForm.tsx:87-88`).
- `AuthProvider`/`LoginButton` non sono mai montati (`src/app/layout.tsx:17-21`,
  `src/app/page.tsx:29-31`): l'app è accessibile senza login e l'intero stack MSAL è codice morto.
- `dataverseClient` (createRequest/getRequests/addWorkflowHistory) ed
  `executeTransition` non hanno alcun call-site; la Dashboard riceve sempre un array vuoto
  (`src/app/page.tsx:26`).
- `DataverseClient` istanzia una seconda `PublicClientApplication` mai `initialize()`-ata
  (`dataverseClient.ts:16-18`): con msal-browser v4 le chiamate fallirebbero comunque a runtime.

**Conseguenza (conflitto risolto: "hardening" vs "cablaggio")**: indurire un layer mai invocato
non produce valore. L'Ondata 1 antepone perciò gli interventi di messa in sicurezza immediata e il
cablaggio minimo, e l'hardening viene fatto contestualmente al cablaggio, non prima.

### 1.2 Finding trasversali confermati (deduplicati tra le fasi)

| # | Finding | Evidenza | Fasi concordi |
|---|---|---|---|
| F1 | Dati personali reali di dipendenti (nomi, telefoni, email) committati nel repo e inclusi nel bundle client di un'app senza login — potenziale data breach da valutare con DPO | `piano_acquisti_data.json`, import statico in `src/app/page.tsx:16` | 4 |
| F2 | Audit trail: scrittura best-effort (`console.error` e si prosegue) e comunque mai invocata; timestamp client-side; nessuna immutabilità | `dataverseClient.ts:349-361`, `workflow.ts:183-210` | 1, 2, 4 |
| F3 | Nessun enforcement server-side: ruoli/transizioni verificati solo nel browser; con lo stesso token delegato un utente può PATCHare qualunque record o alzarsi il ruolo via Web API | `workflow.ts:154-178`, `dataverseClient.ts:104-111` | 1, 2, 4 |
| F4 | Triage urgenza critica via keyword su testo libero (la parola "compliance" o "emergenza" forza il Track 1 24-48h) | `triage.ts:111-158` | 2, 4, 5 |
| F5 | Ordine triage errato: il criterio Fast Track "<€15K" (`triage.ts:193-199`) scatta prima della Semplificata → donazioni <€15K saltano le regole donazioni DGR 306/2024 | `triage.ts:77-97` | 4, 5 |
| F6 | Incoerenza DGR 306/2024: `validations.ts:17-52` blocca le donazioni con materiali dedicati, `triage.ts:315-322` le instrada invece a HTA completo; warning a `triage.ts:239-242` è codice morto | — | 4, 5 |
| F7 | Bug SLA: `calcolaGiorniResidui` clampa a ≥0 (`triage.ts:469`) quindi `isInRitardo` (`<0`, riga 489) è sempre `false`: lo scadenzario Multi-Track è inoperante | — | 1, 2, 5 |
| F8 | Persistenza parziale: `createRequest` salva ~19 campi su 60+ (budget/service/consumabili/donazione/triage quasi interi esclusi); lookup richiedente commentato (`dataverseClient.ts:101`); `numeroProgressivo` mai generato | `dataverseClient.ts:78-102` | 1, 2, 4, 5 |
| F9 | OData injection: filtri costruiti per concatenazione (`ts_email eq '${email}'` a `dataverseClient.ts:259`; passthrough del filtro a 131-149) | — | 2 |
| F10 | Auto-provisioning: qualunque account autenticato viene creato in `ts_utentis` con ruolo operativo `RESPONSABILE_UO` (`dataverseClient.ts:292`), aggravato dal fallback authority `'common'` (`msalConfig.ts:14`) | — | 2, 4 |
| F11 | Nessun test automatico a fronte di logica normata implementata in funzioni pure facilmente testabili | `package.json:6-12` | 1, 2 |
| F12 | Procurement D.Lgs. 36/2023: nessun campo RUP/DEC/CIG/CUI nel modello; nessuna protocollazione/conservazione a norma; `ts_ordini_estar` documentata ma mai implementata | `src/types/index.ts`, `SETUP_DATAVERSE_TABLES.md:306` | 3, 4, 5 |
| F13 | Accessibilità: label non associate, elementi cliccabili non da tastiera (`RequestManager.tsx:296-298`), contrasto badge, dichiarazione AgID assente | — | 4 |
| F14 | Nessuna integrazione documentale; `Attachment.url` senza storage (`types/index.ts:359-367`) | — | 1, 3 |

### 1.3 Conflitti risolti

| Conflitto | Decisione | Motivazione |
|---|---|---|
| Hardening `dataverseClient` prima o dopo il cablaggio | Cablaggio e hardening nella stessa ondata, hardening contestuale | Il layer non ha call-site: indurire codice morto non riduce alcun rischio reale |
| BFF server-side (sicurezza) vs SPA diretta (velocità) | BFF incrementale: prima solo le SCRITTURE critiche (transizioni + audit + submit), letture in SPA finché non migrate | Riduce subito la superficie d'attacco senza bloccare la UI; l'enforcement vero resta comunque la security-role Dataverse |
| SharePoint: A (nativo) vs B (Graph) vs C (Power Automate) | **A + C** come default, **B** solo come estensione (metadati custom, deposito report) | A richiede zero codice e riusa il token `user_impersonation` già consentito; B introdurrebbe il primo layer server-side da zero. Vincolo: UNA sola location per i fascicoli per evitare il rischio "doppio fascicolo divergente" (Fase 3) |
| Immutabilità audit vs correzioni operative | Append-only: mai UPDATE/DELETE su `ts_workflow_histories`, le correzioni sono nuove voci di rettifica; privilegi Dataverse: Create sì, Write/Delete no | Valore probatorio (DEC/RUP) e coerenza GDPR |
| Vercel vs Azure SWA (residenza EU) | Decisione in Ondata 3 con DPO; nel frattempo `regions: ["fra1"]` in `vercel.json` appena esistono Route Handler | I dati risiedono comunque in Dataverse/SPO EU; il problema nasce solo con funzioni server che toccano documenti |

---

## 2. Roadmap in 3 ondate

Legenda impatto/sforzo: A/M/B = Alto/Medio/Basso; S/M/L = Small/Medium/Large.

### Ondata 1 — Messa in sicurezza, cablaggio minimo, audit trail, test

| # | Intervento | Impatto | Sforzo | Dipendenze |
|---|---|---|---|---|
| 1.1 | PR-01 Rimozione dati personali dal repo/bundle | A (GDPR) | S | Valutazione DPO su storia git |
| 1.2 | PR-02 Montare autenticazione + fix MSAL (istanza unica, no `'common'`, fail-fast su env) | A | M | App registration già esistente |
| 1.3 | PR-03 Hardening `dataverseClient` (retry/backoff/timeout, escape OData, audit non silenzioso, fix `updateRequest`) | A | M | — |
| 1.4 | PR-04 Infrastruttura test (Vitest+RTL) + suite su triage/validazioni/workflow | A | M | — |
| 1.5 | PR-05 Fix triage/SLA guidati dai test (F4, F5, F6, F7) | A | M | PR-04 |
| 1.6 | Config Dataverse (no-code): security role con `ts_workflow_histories` append-only; Autonumber su `ts_numero_progressivo`; disattivare auto-provisioning ruoli | A | S | Admin Power Platform |

### Ondata 2 — Struttura: persistenza reale, BFF, procurement, dashboard/KPI, PDF

| # | Intervento | Impatto | Sforzo | Dipendenze |
|---|---|---|---|---|
| 2.1 | PR-06 Collegare i form alla persistenza + caricare le richieste in Dashboard | A | L | PR-02, PR-03, Autonumber |
| 2.2 | PR-07 BFF Route Handler (`app/api/*`) per scritture critiche con Zod + enforcement ruoli + timestamp server | A | L | PR-06; decisione hosting funzioni (fra1/Azure) |
| 2.3 | PR-08 Campi procurement RUP/DEC/CIG/CUI (+ `ts_cig` per la metadatazione SPO) | A | M | Validazione RUP/ufficio gare |
| 2.4 | PR-09 Dashboard: scadenzario semaforo, vista UO/dipartimento, pipeline stati, budget corretto + KPI aging/%ritardo | A | M | PR-05, PR-06 |
| 2.5 | PR-10 Generazione PDF moduli compilati | M | M | PR-06 |
| 2.6 | PR-11 Accessibilità AgID/WCAG (label, tastiera, contrasto, dichiarazione) | M | M | Audit accessibilità |

### Ondata 3 — SharePoint/M365 e hosting

| # | Intervento | Impatto | Sforzo | Dipendenze |
|---|---|---|---|---|
| 3.1 | Config (no-code): Document management Dataverse↔SPO su `ts_richieste` + libreria/colonne | A | S | Power Platform Admin + SharePoint Admin, sito confermato |
| 3.2 | PR-12 UI fascicolo: elenco documenti + deep link via entità `sharepointdocument` | A | M | 3.1 |
| 3.3 | Flussi Power Automate: al cambio stato → PDF con metadati in libreria + notifiche Teams/Outlook | A | M | 3.1, PR-08, PR-10, licenze premium account di servizio, DLP |
| 3.4 | PR-13 (opz.) Graph `Sites.Selected` da BFF: metadati custom, deposito report trimestrali | M | L | App registration confidential client + admin consent + grant per-sito |
| 3.5 | Decisione hosting: Vercel `regions:["fra1"]` vs Azure Static Web Apps West Europe | M | S | DPO / IT |

---

## 3. Backlog di PR (in ordine di esecuzione)

Ogni PR è atomica; nessuna proposta senza "come si testa" e "come si torna indietro".

### PR-01 — Rimozione dati personali da repo e bundle
- **File**: `piano_acquisti_data.json`, `src/app/page.tsx` (import riga 16), eventuali viste che lo consumano; `.gitignore`.
- **Descrizione**: sostituire il file con dataset anonimizzato/pseudonimizzato o spostare i dati in Dataverse dietro autenticazione; il file reale esce dal repo. Con il DPO valutare la riscrittura della storia git e la rotazione del repo (i dati restano nei commit precedenti).
- **Criteri di accettazione**: nessun nome/telefono/email reale in `git grep` sul working tree né nel bundle (`npm run build` + ispezione output); l'app compila e la vista piano acquisti funziona con dati anonimi.
- **Test**: build + verifica manuale della vista; script di scansione pattern email/telefono sul bundle.
- **Rischio regressione**: Basso (vista piano acquisti potrebbe mostrare dati fittizi).
- **Rollback**: revert del commit (ma NON ripristinare il file con dati reali).

### PR-02 — Montare autenticazione e correggere la configurazione MSAL
- **File**: `src/app/layout.tsx`, `src/app/page.tsx`, `src/contexts/AuthContext.tsx`, `src/lib/msalConfig.ts`, `src/lib/dataverseClient.ts` (istanza MSAL condivisa).
- **Descrizione**: montare `AuthProvider` nel layout, gate di login sull'app; una sola `PublicClientApplication` inizializzata e condivisa (rimuovere quella privata di `dataverseClient.ts:16-18`); eliminare il fallback authority `'common'` (`msalConfig.ts:14`) e il clientId `''` con fail-fast esplicito se le env mancano; fallback `acquireTokenPopup` solo da gesto utente (altrimenti redirect).
- **Criteri di accettazione**: senza login nessuna vista dati; con login SSO Entra ID si accede; env mancanti → errore chiaro a startup, non pagina aperta.
- **Test**: unit sul guard; e2e manuale login/logout su ambiente di sviluppo con app registration di test.
- **Rischio regressione**: Medio (l'app diventa inaccessibile senza account: comportamento voluto ma da comunicare).
- **Rollback**: revert; l'app torna aperta come oggi.

### PR-03 — Hardening `dataverseClient` (audit trail non silenzioso)
- **File**: `src/lib/dataverseClient.ts`, `src/lib/workflow.ts` (generateId → `crypto.randomUUID()`).
- **Descrizione**: (a) `addWorkflowHistory` rilancia l'errore con dettaglio (`response.text()`), e chi esegue una transizione la considera fallita se l'audit non è scritto (in attesa del BFF: scrivere PRIMA la voce di audit, POI lo stato); (b) wrapper `fetch` unico con timeout (`AbortController`), retry con backoff su 429/503 rispettando `Retry-After`, errori tipizzati; (c) escape degli apici e encoding dei filtri OData (`ts_email eq '...'` a riga 259, passthrough a 131-149); (d) `updateRequest`: confronti `!== undefined` per permettere azzeramenti; (e) rimozione `Prefer: return=representation` dalle GET/DELETE.
- **Criteri di accettazione**: una transizione con audit fallito NON risulta completata; 429 simulato → retry e successo; email con apice non altera il filtro.
- **Test**: unit con `fetch` mockato (429→200, 500 su history, injection); i test entrano nella suite di PR-04.
- **Rischio regressione**: Basso (il layer oggi non ha chiamanti in produzione).
- **Rollback**: revert del file.

### PR-04 — Infrastruttura test + suite sui percorsi critici
- **File**: `package.json` (script `test`, devDeps `vitest`, `@testing-library/react`, `jsdom`), `vitest.config.ts`, `src/lib/__tests__/{triage,validations,workflow,numberFormat}.test.ts`.
- **Descrizione**: Vitest + Testing Library; copertura delle funzioni pure: soglie €15K/€50K/€100K, donazioni DGR 306/2024, service/consumabili (30K, 5 anni, 30% penali, dedicati), transizioni per ruolo, `parseItalianNumber`. I test fotografano ANCHE i bug noti (F4-F7) come `test.fails`, che PR-05 farà passare.
- **Criteri di accettazione**: `npm test` verde in CI locale; copertura ≥80% su `src/lib/{triage,validations,workflow}.ts`.
- **Test**: è la PR stessa; nessun codice di produzione toccato.
- **Rischio regressione**: Nullo.
- **Rollback**: revert (solo devDeps e file di test).

### PR-05 — Correzione triage e SLA (guidata dai test)
- **File**: `src/lib/triage.ts`, `src/types/index.ts` (campi override), `src/lib/validations.ts` (coerenza F6).
- **Descrizione**: (a) F7: rimuovere il clamp `Math.max(0, ...)` (riga 469) così `isInRitardo` funziona; giorni residui negativi = ritardo; Track 1 valutato in ore; (b) F5: valutare le regole donazioni/Semplificata PRIMA della soglia €15K, e comunque una donazione non deve mai cadere nel ramo Fast Track generico; (c) F6: donazione con materiali dedicati → esito BLOCCANTE coerente con `validations.ts` (non semplice reindirizzo a Track 4), warning non più codice morto; (d) F4: sostituire il keyword-matching con flag strutturati nel form (safety critica / blocco servizio / obbligo normativo) + campo motivazione, mantenendo le keyword solo come suggerimento non vincolante; (e) sostituzione 1:1 Fast Track solo con flag "già aggiudicata" esplicito; (f) override manuale del track da parte del Coordinatore con motivazione obbligatoria (persistere `motivazioneAssegnazioneTrack`, `dataAssegnazioneTrack`).
- **Criteri di accettazione**: i `test.fails` di PR-04 diventano verdi; casi limite documentati in WORKFLOW.md aggiornato.
- **Test**: suite PR-04 estesa (donazione €10K, "non è un'emergenza" nel testo, sostituzione non aggiudicata, richiesta scaduta da 3 giorni).
- **Rischio regressione**: Medio (cambiano le assegnazioni track: confrontare su casistica reale con il Coordinatore CommAz prima del merge).
- **Rollback**: revert; le regole tornano alle attuali (bug inclusi).

### PR-06 — Cablaggio: i form persistono, la dashboard legge
- **File**: `src/components/forms/*.tsx`, `src/app/page.tsx`, `src/lib/dataverseClient.ts` (mapping completo), `SETUP_DATAVERSE_TABLES.md`.
- **Descrizione**: submit → validazioni → `eseguiTriage` → `createRequest` con mapping COMPLETO (budget, service, consumabili, donazione, triage, lookup `ts_richiedente@odata.bind` decommentato); `numeroProgressivo` da Autonumber Dataverse (mai client-side); `page.tsx` carica `getRequests()` e alimenta Dashboard/RequestManager; storico letto da `ts_workflow_histories`.
- **Criteri di accettazione**: richiesta creata dal form visibile in Dashboard dopo refresh; ogni campo compilato ritrovabile in Dataverse; due submit concorrenti → numeri progressivi distinti.
- **Test**: integration test con client mockato; UAT su environment Dataverse di test; checklist campo-per-campo form→tabella.
- **Rischio regressione**: Medio-alto (primo collegamento reale; feature flag `NEXT_PUBLIC_ENABLE_PERSISTENCE` per attivazione graduale).
- **Rollback**: spegnere il flag o revert; i form tornano demo.

### PR-07 — BFF minimo: Route Handler per le scritture critiche
- **File**: nuovi `src/app/api/richieste/route.ts`, `src/app/api/richieste/[id]/transizioni/route.ts`, `src/lib/server/{auth,dataverse}.ts`; `vercel.json` (`regions: ["fra1"]`).
- **Descrizione**: le SCRITTURE (submit, transizioni, audit) passano dal server: validazione Zod, verifica ruolo da `ts_utentis` (non dal client), timestamp server, scrittura audit transazionale (prima history, poi stato; compensazione in caso di errore). Le letture restano in SPA (migrazione successiva). Il token utente è validato e usato on-behalf o inoltrato; nessun segreto nel bundle (env server-side senza prefisso `NEXT_PUBLIC_`).
- **Criteri di accettazione**: chiamata diretta all'API con ruolo non autorizzato → 403; transizione senza audit scritto → 500 e stato invariato; nessuna nuova env `NEXT_PUBLIC_*`.
- **Test**: unit sui Route Handler (Zod, ruoli); test manuale con curl e token di ruoli diversi.
- **Rischio regressione**: Medio (introduce runtime server; dietro feature flag come PR-06).
- **Rollback**: la SPA può tornare a scrivere direttamente (codice PR-06 conservato) — flag di routing client.
- **Nota**: l'enforcement definitivo resta la configurazione delle security role Dataverse (intervento 1.6): il BFF riduce la superficie ma non sostituisce i permessi a livello dati.

### PR-08 — Campi procurement (D.Lgs. 36/2023)
- **File**: `src/types/index.ts`, `src/lib/dataverseClient.ts`, form interessati, `SETUP_DATAVERSE_TABLES.md`.
- **Descrizione**: aggiungere `rup`, `dec`, `cig` (`ts_cig`), `cui`/CUP di programmazione, riferimenti atto di approvazione; compilazione nelle fasi post-approvazione; il CIG è anche prerequisito della metadatazione SharePoint (Fase 3).
- **Criteri di accettazione**: richiesta approvata collegabile a RUP/DEC/CIG; campi visibili in dettaglio richiesta; naming validato con ufficio gare/ESTAR.
- **Test**: unit mapping + UAT con un caso reale anonimizzato.
- **Rischio regressione**: Basso (campi additivi).
- **Rollback**: revert; le colonne Dataverse restano ma inutilizzate (innocuo).

### PR-09 — Dashboard operativa e KPI
- **File**: `src/components/dashboard/Dashboard.tsx`, nuovo `src/lib/sla.ts` (`getSlaStatus`), `src/lib/workflow.ts` (`calculateWorkflowStats` corretta: tempo di completamento, non età), `src/lib/reports.ts`.
- **Descrizione**: scadenzario con semaforo per track (in tempo / in scadenza / in ritardo), vista per UO/dipartimento con aging e budget, pipeline per stato (sola lettura), correzione etichette budget (richiesto vs approvato vs plafond); KPI: % evase nei tempi per track, tempo medio per fase, % conformità DGR, aging/% in ritardo (wireframe testuali in `fase5_dominio.json`).
- **Criteri di accettazione**: con dati di test una richiesta oltre SLA appare "in ritardo" (oggi impossibile); numeri budget riconciliabili a mano.
- **Test**: unit su `getSlaStatus` e stats; snapshot test componenti.
- **Rischio regressione**: Basso (viste additive).
- **Rollback**: revert dei componenti.

### PR-10 — Generazione PDF dei moduli compilati
- **File**: nuovo `src/lib/pdf/` (o Route Handler `app/api/richieste/[id]/pdf`), template MOD.01/MOD.02.
- **Descrizione**: dal form/dettaglio → PDF fedele al modulo cartaceo (sostituisce `window.print()`); base per il filing SharePoint dell'Ondata 3. Se si sceglie Power Automate + Word template (opzione C), questa PR si riduce al trigger e al template.
- **Criteri di accettazione**: PDF con tutti i campi, numerazione e data; confronto visivo col modulo ufficiale approvato dall'UOC.
- **Test**: golden file su richiesta campione.
- **Rischio regressione**: Basso.
- **Rollback**: revert; resta `window.print()`.

### PR-11 — Accessibilità AgID/WCAG 2.1 AA
- **File**: tutti i form, `RequestManager.tsx:296-298` (div cliccabili → `<button>`), `Dashboard.tsx:242-249` e `types/index.ts:462-499` (contrasto/uso del colore), footer (link dichiarazione).
- **Descrizione**: label associate (`htmlFor`/`aria`), navigazione tastiera, contrasto ≥4.5:1, badge track con testo oltre al colore, dichiarazione di accessibilità (obbligo L. 4/2004).
- **Criteri di accettazione**: axe-core senza violazioni gravi sulle viste principali; navigazione completa da sola tastiera.
- **Test**: axe/lighthouse in CI + test manuale screen reader.
- **Rischio regressione**: Basso.
- **Rollback**: revert (ma i fix sono normativamente dovuti).

### PR-12 — UI fascicolo SharePoint (dopo attivazione document management)
- **File**: `src/lib/dataverseClient.ts` (query entità `sharepointdocument`), `RequestManager.tsx`/`Dashboard.tsx` (pannello "Documenti" con deep link).
- **Descrizione**: per ogni richiesta, elenco dei documenti del fascicolo SPO e link `absoluteurl`; nessun nuovo permesso: riusa `user_impersonation` (Fase 3, opzione A).
- **Criteri di accettazione**: documento caricato in SPO visibile nel dettaglio richiesta; utente senza accesso al sito → messaggio chiaro, non errore muto.
- **Test**: UAT su environment di test con document management attivo.
- **Rischio regressione**: Basso (pannello additivo).
- **Rollback**: nascondere il pannello.
- **Dipendenza dura**: intervento 3.1 (config admin) PRIMA del merge.

### PR-13 (opzionale) — Graph `Sites.Selected` dal BFF
- **File**: `src/lib/server/graphClient.ts`, `app/api/documenti/*`, `app/api/report/deposito`.
- **Descrizione**: solo se A+C non bastano: metadati custom sulle colonne della libreria, listing filtrato, deposito automatico dei report trimestrali (`reports.ts`). Confidential client con certificato, credenziali SOLO server-side/Key Vault, retry su `Retry-After`. Snippet pronti in `fase3_sharepoint.json`.
- **Criteri di accettazione**: token app-only ottenuto con certificato; scrittura POSSIBILE solo sul sito col grant; 429 gestito.
- **Test**: integration su sito di test con grant dedicato.
- **Rischio regressione**: Basso sul client; il rischio è di configurazione (grant troppo ampio: verificare con `GET /sites/{id}/permissions`).
- **Rollback**: revocare il grant per-sito + revert.
- **Dipendenze dure**: app registration + admin consent + grant per-sito PRIMA di iniziare.

---

## 4. Approvazioni da chiedere a terzi

| Chi | Cosa | Serve per |
|---|---|---|
| **DPO** | Valutazione incidente `piano_acquisti_data.json` (dati nel repo/bundle, storia git); informativa art. 13 per `ts_utentis`; policy retention; DPIA; avvertenze sui campi liberi (rischio dati pazienti); log accessi in lettura | PR-01, PR-02, Ondata 2 |
| **Ufficio legale / RUP** | Conferma campi e flusso RUP/DEC/CIG/CUI; requisiti di protocollazione e conservazione a norma degli atti in SharePoint | PR-08, Ondata 3 |
| **Global Admin M365** | (Solo PR-13) nuova app registration confidential client + admin consent `Sites.Selected` (application) | PR-13 |
| **SharePoint Admin** | Creazione sito/libreria "Fascicoli Richieste TS" + colonne indicizzate; (PR-13) grant `Sites.Selected` role `write` sul solo sito di destinazione | 3.1, PR-12, PR-13 |
| **Power Platform Admin** | Attivazione Document management SPO sull'environment e sulla tabella `ts_richieste`; security role append-only su `ts_workflow_histories`; Autonumber; policy DLP per i connettori; licenze premium per l'account di servizio Power Automate (es. `svc-hta@…`) | 1.6, 3.1, 3.3 |
| **Coordinatore CommAz / UOC Tecnologie** | Validazione delle nuove regole di triage (PR-05) su casistica reale; conferma SLA in giorni di calendario vs lavorativi; conferma sito SPO di destinazione (placeholder `…/sites/DipartimentoTecnico` — ASSUNZIONE DA VERIFICARE; tenant probabile `usltoscananordovest.onmicrosoft.com`, da `NEXT_STEPS.md:74`) | PR-05, Ondata 3 |
| **Referente accessibilità AgID** | Audit WCAG e pubblicazione dichiarazione di accessibilità | PR-11 |
| **IT AUSL** | Custodia/rotazione certificato del confidential client; scelta hosting (Vercel `fra1` vs Azure SWA West Europe) | PR-07, PR-13, 3.5 |

---

## 5. Assunzioni da verificare (riepilogo)

1. Nomi entity set Dataverse (`ts_richiestes`, `ts_utentis`, `ts_workflow_histories`): pluralizzazione ipotizzata, da confermare sull'environment reale (unico finding "sospetto" della Fase 2).
2. Sito SharePoint di destinazione e tenant (vedi tabella approvazioni).
3. Esistenza/creazione della tabella `ts_ordini_estar` (documentata, mai implementata) per il KPI di scostamento budget.
4. SLA in giorni di calendario o lavorativi (regolamento aziendale).
5. Licenze Power Automate premium sull'account di servizio.
6. Ambiente Dataverse di test disponibile per UAT prima di ogni attivazione.
