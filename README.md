# Gestionale Richieste Tecnologie Sanitarie

Sistema completo per la gestione delle richieste di acquisto di tecnologie sanitarie in Azienda Sanitaria, implementando il **Sistema Multi-Track per Health Technology Assessment (HTA)**.

## 📋 Panoramica

Questo gestionale integra:
- **Procedura TS revisionata** - Procedura Acquisizione Tecnologie Sanitarie
- **Sistema Multi-Track** - 4 livelli di urgenza e complessità (24h - 45 giorni)
- **ADDENDUM Service/Consumabili** - Gestione vendor lock-in e DGR 306/2024
- **Workflow multi-livello** - Validazioni da UO fino a Direzione Amministrativa
- **Registro tracciabilità** - Completa audit trail di ogni richiesta
- **Report trimestrali** - Analytics e monitoraggio KPI

## 🎯 Caratteristiche Principali

### Sistema Multi-Track (4 Livelli)

| Track | Tempo | Quando si Applica |
|-------|-------|-------------------|
| **Track 1 - Urgenza Critica** | 24-48h | Safety critica, blocco servizio essenziale, obbligo normativo urgente |
| **Track 2 - Fast Track** | 5-7 giorni | Sostituzioni 1:1, urgenze con workaround, sotto €15K, service ESTAR |
| **Track 3 - Procedura Semplificata** | 15-20 giorni | Donazioni <€50K, ampliamenti dotazione, upgrade programmabili |
| **Track 4 - HTA Completo** | 30-45 giorni | Nuove tecnologie, alto impatto, donazioni >€50K, innovativi classe IIb/III |

### Triage Automatico

Il sistema assegna automaticamente il track appropriato basandosi su:
- Valore economico dell'acquisto
- Tipo di acquisizione (programmato, sostituzione, donazione, ecc.)
- Presenza di service/consumabili dedicati
- Impatto organizzativo
- Requisiti normativi (DGR 306/2024, DGR 737/2022)

### Validazioni DGR 306/2024

Il sistema **blocca automaticamente** richieste non conformi:
- ❌ Donazioni con materiali d'uso dedicati (VIETATE)
- ⚠️ Service con consumabili dedicati → richiede HTA Completo
- ⚠️ Vendor lock-in senza alternative di mercato

### Workflow Multi-Livello

Workflow differenziato per ogni track con approvazioni successive:
1. **Responsabile UO** - Compilazione richiesta
2. **Direttore Dipartimento** - Validazione priorità
3. **Coordinatore CommAz** - Triage e pre-screening tecnico-economico
4. **Commissione Aziendale** - Valutazione collegiale (Track 3 e 4)
5. **Direzione Sanitaria** - Ratifica parere tecnico (Track 4)
6. **Direzione Amministrativa** - Approvazione finale

## 🏗️ Architettura Tecnica

### Stack Tecnologico

- **Framework**: Next.js 14 (App Router)
- **Linguaggio**: TypeScript 5.3
- **UI**: React 18 + Tailwind CSS 3.4
- **State Management**: Zustand (opzionale)
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React

### Struttura Progetto

```
gestionale_richieste_TS/
├── src/
│   ├── types/              # Modelli dati TypeScript
│   │   └── index.ts        # Tutti i tipi: Request, Track, User, Workflow
│   ├── lib/                # Business logic
│   │   ├── triage.ts       # Sistema multi-track e triage automatico
│   │   ├── validations.ts  # Validazioni DGR 306/2024, Service, Consumabili
│   │   └── workflow.ts     # Gestione stati e transizioni workflow
│   ├── components/
│   │   ├── dashboard/      # Dashboard e statistiche
│   │   │   └── Dashboard.tsx
│   │   ├── forms/          # Form richieste
│   │   │   └── RequestForm.tsx
│   │   └── shared/         # Componenti condivisi
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx        # Pagina principale
│   └── styles/
│       └── globals.css
├── public/                 # Asset statici
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🚀 Installazione e Avvio

### Prerequisiti

- Node.js 18.x o superiore
- npm o yarn

### Setup

1. **Clone del repository**
```bash
git clone https://github.com/ssurli/gestionale_richieste_TS.git
cd gestionale_richieste_TS
```

2. **Installazione dipendenze**
```bash
npm install
```

3. **Avvio development server**
```bash
npm run dev
```

4. **Accesso applicazione**
Apri il browser su: http://localhost:3000

### Build per produzione

```bash
npm run build
npm start
```

## 📊 Modelli Dati Principali

### TechnologyRequest

Modello principale della richiesta con:
- Dati identificativi (ID, numero progressivo, date)
- Tracking workflow (stato, track assegnato, giorni trascorsi)
- Richiedenti e struttura organizzativa
- Tipo e caratteristiche apparecchiatura
- Budget e copertura finanziaria
- Service (opzionale)
- Consumabili (opzionale)
- Donazione (opzionale)
- Storico modifiche completo

### TrackType (Enum)

```typescript
enum TrackType {
  URGENZA_CRITICA = 'TRACK_1',      // 24-48h
  FAST_TRACK = 'TRACK_2',            // 5-7 giorni
  SEMPLIFICATA = 'TRACK_3',          // 15-20 giorni
  HTA_COMPLETO = 'TRACK_4'           // 30-45 giorni
}
```

### RequestStatus (Enum)

Stati workflow:
- BOZZA, SOTTOMESSA, IN_TRIAGE, ASSEGNATO_TRACK
- IN_VALIDAZIONE_DIPARTIMENTO, IN_PRESCREENING
- IN_VALUTAZIONE_COMMAZ, IN_APPROVAZIONE_DS, IN_APPROVAZIONE_DA
- APPROVATA, RESPINTA, RINVIATA, COMPLETATA

## 🔧 Funzioni Chiave

### Sistema Triage

```typescript
import { eseguiTriage } from '@/lib/triage';

const result = eseguiTriage(richiesta);
// Ritorna: { trackAssegnato, motivazione, criterioApplicato, flagAutomatico }
```

### Validazioni

```typescript
import {
  validaDGR306_2024,
  validaServiceContract,
  validaConsumabili
} from '@/lib/validations';

// Valida conformità DGR 306/2024
const dgrValidation = validaDGR306_2024(donazione);

// Valida service per vendor lock-in
const serviceValidation = validaServiceContract(service);

// Valida consumabili
const consumabiliValidation = validaConsumabili(consumabili);
```

### Workflow

```typescript
import { executeTransition, approveRequest, rejectRequest } from '@/lib/workflow';

// Esegui transizione
const updated = executeTransition(request, user, toStatus, note);

// Approva richiesta
const approved = approveRequest(request, user, note);

// Respingi richiesta
const rejected = rejectRequest(request, user, motivazione);
```

## 📈 Dashboard e Monitoraggio

La dashboard fornisce:
- **KPI in tempo reale**: richieste in corso, completate, tempo medio approvazione
- **Distribuzione per track**: visualizzazione volumi per ciascun livello
- **Alert scadenze**: richieste in ritardo rispetto ai tempi track
- **Budget overview**: budget richiesto vs disponibile
- **Richieste recenti**: tabella con ultimi inserimenti

## 🔐 Ruoli e Permessi

### Ruoli Utente

```typescript
enum UserRole {
  RESPONSABILE_UO,
  DIRETTORE_UOC,
  DIRETTORE_DIPARTIMENTO,
  RESPONSABILE_ZONA_DISTRETTO,
  COORDINATORE_COMMAZ,        // Ruolo chiave per triage
  MEMBRO_COMMAZ,
  USL_TS,
  USL_PM,
  ESTAR_TS,
  DIREZIONE_SANITARIA,
  DIREZIONE_AMMINISTRATIVA,
  ADMIN
}
```

### Matrice Responsabilità

| Fase | Responsabile | Tempo Max |
|------|-------------|-----------|
| Compilazione richiesta | Responsabile UO | - |
| Validazione Dipartimento | Direttore Dipartimento | 2-5 gg |
| Triage e assegnazione track | Coordinatore CommAz | 3-4h (urgenza) / 3gg (fast) |
| Pre-screening | Coordinatore CommAz | Varia per track |
| Valutazione CommAz | Commissione completa | 7 gg (semplificata) / variabile (HTA) |
| Ratifica DS | Direzione Sanitaria | Solo Track 4 |
| Approvazione finale | Direzione Amministrativa | 2-3 gg |

## 📋 Conformità Normativa

### DGR 306/2024
- ❌ **VIETATE** donazioni con materiale d'uso dedicato
- ✅ Validazione automatica nel sistema
- ⚠️ Warning immediato all'utente

### DGR 737/2022
- Tecnologie innovative classe IIb/III
- Invio automatico a Centro Operativo HTA Regionale
- Track 4 obbligatorio

### Procedura TS Aziendale
- Acquisto programmato vs non programmato
- Soglie economiche (€5.000, €15.000, €40.000)
- Coinvolgimento ESTAR TS

## 🎨 UI/UX

### Design System

- **Colori Track**:
  - Urgenza Critica: Rosso (#dc2626)
  - Fast Track: Ambra (#f59e0b)
  - Semplificata: Blu (#3b82f6)
  - HTA Completo: Viola (#8b5cf6)

- **Badge stati**: Colori semantici per ogni stato workflow
- **Cards responsive**: Layout adattivo mobile-first
- **Form multi-step**: 5 step guidati con validazione progressiva

## 📊 Report e Analytics

### Report Trimestrale

Generato automaticamente ogni trimestre con:
- Volumi per track
- Tempi medi di risposta
- Percentuali approvazione/rifiuto
- Identificazione colli di bottiglia
- Raccomandazioni ottimizzazione

### Dashboard Analytics

- Grafici distribuzione richieste
- Trend temporali
- Budget utilization
- Performance per dipartimento

## 🔄 Workflow Esempio

### Track 2 - Fast Track (Sostituzione 1:1)

1. **Responsabile UO** compila richiesta sostituzione ecografo fuori uso
2. Sistema rileva: sostituzione 1:1, già aggiudicato → **assegna Track 2**
3. **Direttore Dipartimento** valida priorità (2 gg)
4. **Coordinatore CommAz** pre-screening: verifica Det. ESTAR, budget (3 gg)
5. **Direzione Amministrativa** approva (2 gg)
6. **Totale: 7 giorni** ✅

### Track 4 - HTA Completo (Nuova tecnologia)

1. **Responsabile UO** richiede nuova tecnologia robotica chirurgia
2. Sistema rileva: nuova tecnologia, alto impatto → **assegna Track 4**
3. **Coordinatore CommAz** istruttoria approfondita
4. **CommAz completa** con audizioni, analisi MCDA
5. **Direzione Sanitaria** ratifica parere tecnico
6. **Direzione Amministrativa** autorizzazione finale
7. **Totale: 30-45 giorni**

## 🛠️ Estensibilità

### Aggiungere nuovi campi

Modificare `src/types/index.ts`:
```typescript
export interface TechnologyRequest {
  // ... campi esistenti
  nuovoCampo: string;
}
```

### Personalizzare criteri triage

Modificare `src/lib/triage.ts`:
```typescript
function verificaFastTrack(richiesta: Partial<TechnologyRequest>) {
  // Aggiungi nuovi criteri
}
```

### Aggiungere validazioni custom

Modificare `src/lib/validations.ts`:
```typescript
export function validaCustom(data: CustomData): ValidationResult {
  // Implementa logica
}
```

## 📝 TODO / Roadmap

- [ ] Backend API (Node.js/Express o Python/FastAPI)
- [ ] Database (PostgreSQL)
- [ ] Autenticazione e autorizzazione (JWT/OAuth)
- [ ] Upload allegati
- [ ] Notifiche email
- [ ] Export PDF richieste
- [ ] Integrazione ESTAR TS
- [ ] App mobile (React Native)
- [ ] Report Excel/PDF
- [ ] Audit log completo

## 🤝 Contributi

Per contribuire al progetto:

1. Fork del repository
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Progetto proprietario - Azienda Sanitaria

## 👥 Autori

- **Sviluppo iniziale**: Sistema basato su documentazione aziendale
- **Procedura TS**: UO Tecnologie Sanitarie USLTO
- **ADDENDUM Multi-Track**: Regolamento Aziendale HTA
- **ADDENDUM Service/Consumabili**: Gestione criticità contratti

## 📞 Supporto

Per domande o supporto:
- Email: [inserire email di supporto]
- Issues GitHub: https://github.com/ssurli/gestionale_richieste_TS/issues

---

## 🎓 Documentazione di Riferimento

### Documenti Integrati

1. **Procedura TS revisionata.doc** - Procedura Acquisizione Tecnologie Sanitarie
2. **ADDENDUM_Procedura_MultiTrack.docx** - Sistema Multi-Track 4 livelli
3. **ADDENDUM_Service_Consumabili.docx** - Gestione Service e Consumabili
4. **MOD.01_RICHIESTA ACQUISTO ELM.pdf** - Modulo richiesta generale
5. **MOD_02_RICHIESTA ACQUISTO ECOGRAFI.pdf** - Modulo richiesta ecografi

### Normativa di Riferimento

- **DGR 306/2024** - Divieto donazioni con materiali d'uso dedicato
- **DGR 737/2022** - Tecnologie innovative classe IIb/III
- **L.R. 40/2005** - Commissione regionale valutazione tecnologie

---

**Sistema Multi-Track HTA v1.0** - Healthcare Request Manager
