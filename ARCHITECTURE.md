# Architettura Sistema Gestionale Tecnologie Sanitarie

## Panoramica Architetturale

Il sistema è costruito secondo un'architettura a livelli (layered architecture) con separazione chiara delle responsabilità:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Next.js App Router, React Components, Tailwind CSS)       │
├─────────────────────────────────────────────────────────────┤
│                     BUSINESS LOGIC LAYER                     │
│  (Triage System, Validations, Workflow Manager)             │
├─────────────────────────────────────────────────────────────┤
│                     DATA MODEL LAYER                         │
│  (TypeScript Types, Interfaces, Enums)                      │
├─────────────────────────────────────────────────────────────┤
│                     DATA ACCESS LAYER                        │
│  (Future: API Routes, Database Integration)                 │
└─────────────────────────────────────────────────────────────┘
```

## Data Model Layer

### Principali Entità

#### 1. TechnologyRequest (Entità Centrale)

```typescript
interface TechnologyRequest {
  // Identificazione univoca
  id: string;
  numeroProgressivo: string;  // Es: 2025-001

  // Tracking temporale
  dataCreazione: Date;
  dataUltimaModifica: Date;
  giorniTrascorsi: number;

  // Stato workflow
  statoCorrente: RequestStatus;
  trackAssegnato?: TrackType;

  // Relazioni
  richiedenteId: string;
  richiedente: User;

  // Dati core
  nomeApparecchiatura: string;
  tipoAcquisto: AcquisitionType;
  budget: BudgetCoverage;

  // Opzionali
  service?: ServiceContract;
  consumabili?: Consumables;
  donazione?: Donation;

  // Audit trail
  storico: HistoryEntry[];
}
```

**Relazioni:**
- 1 Request → 1 User (richiedente)
- 1 Request → 0..1 ServiceContract
- 1 Request → 0..1 Consumables
- 1 Request → 0..1 Donation
- 1 Request → N HistoryEntry

#### 2. User (Attori Sistema)

```typescript
interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
  unitaOperativa?: string;
  dipartimento?: string;
}
```

**Ruoli Gerarchici:**
```
RESPONSABILE_UO
  ↓ valida
DIRETTORE_UOC / DIRETTORE_DIPARTIMENTO
  ↓ valida
COORDINATORE_COMMAZ (triage)
  ↓ pre-screening
MEMBRO_COMMAZ (valutazione)
  ↓ parere
DIREZIONE_SANITARIA (ratifica)
  ↓ autorizza
DIREZIONE_AMMINISTRATIVA (decisione finale)
```

#### 3. TrackConfig (Configurazione Track)

```typescript
interface TrackConfig {
  type: TrackType;
  nome: string;
  tempoMassimoGiorni: number;  // SLA
  colore: string;              // UI
  criteri: string[];           // Criteri applicazione
}
```

**Tempi SLA per Track:**
- Track 1: 2 giorni (48h)
- Track 2: 7 giorni
- Track 3: 20 giorni
- Track 4: 45 giorni

## Business Logic Layer

### 1. Triage System (`lib/triage.ts`)

#### Algoritmo Triage

```
Input: Partial<TechnologyRequest>
Output: TriageResult { trackAssegnato, motivazione, criterio }

Algoritmo:
1. Verifica URGENZA_CRITICA
   ├─ Safety critica? → Track 1
   ├─ Blocco servizio essenziale? → Track 1
   └─ Obbligo normativo urgente? → Track 1

2. Verifica Service/Consumabili
   ├─ Service NON ESTAR? → Track 4
   ├─ Consumabili dedicati? → Track 4
   └─ Vendor lock-in? → Track 4

3. Verifica HTA_COMPLETO
   ├─ Nuova tecnologia non aggiudicata? → Track 4
   ├─ Alto impatto organizzativo? → Track 4
   ├─ Donazione >€50K? → Track 4
   ├─ Richiede HTA Regionale? → Track 4
   └─ Budget >€100K? → Track 4

4. Verifica FAST_TRACK
   ├─ Sostituzione 1:1 aggiudicata? → Track 2
   ├─ Urgenza con workaround? → Track 2
   ├─ Valore <€15K? → Track 2
   ├─ Service ESTAR rinnovo? → Track 2
   └─ Consumabili ESTAR? → Track 2

5. Verifica SEMPLIFICATA
   ├─ Donazione <€50K conforme DGR? → Track 3
   ├─ Ampliamento dotazione? → Track 3
   └─ Upgrade programmato? → Track 3

6. Default: Track 4 (HTA Completo)
```

#### Funzioni Chiave

```typescript
// Triage principale
eseguiTriage(richiesta: Partial<TechnologyRequest>): TriageResult

// Verifica Service
verificaServicePerTrack(service: ServiceContract): {
  passaHTACompleto: boolean;
  motivazione: string;
}

// Verifica Consumabili
verificaConsumabiliPerTrack(consumabili: Consumables): {
  passaHTACompleto: boolean;
  motivazione: string;
}

// Calcolo tempi
calcolaGiorniResidui(richiesta: TechnologyRequest): number
isInRitardo(richiesta: TechnologyRequest): boolean
```

### 2. Validation System (`lib/validations.ts`)

#### Validazioni DGR 306/2024

```typescript
function validaDGR306_2024(donazione: Donation): ValidationResult {
  // REGOLA CRITICA: materiali uso dedicati = VIETATO
  if (donazione.materialiUsoDecicati) {
    return {
      isValid: false,
      errors: ['❌ VIOLAZIONE DGR 306/2024']
    };
  }

  // Verifica donatore trasparente
  // Verifica valore donazione
  // Warning per alto valore
}
```

#### Validazioni Service

```typescript
function validaServiceContract(service: ServiceContract): ValidationResult {
  // Verifica dati obbligatori
  // Warning vendor lock-in se consumabili dedicati
  // Alert valori elevati
  // Check penali uscita
  // Validazione coerenza tipo richiesta
}
```

#### Validazioni Consumabili

```typescript
function validaConsumabili(consumabili: Consumables): ValidationResult {
  // Verifica gara ESTAR
  // Warning consumabili dedicati
  // Alert fornitore unico
  // Check consumo annuo elevato
  // Validazione motivazione richiesta
}
```

#### Validazione Coerenza Complessiva

```typescript
function validaCoerenzaRichiesta({
  isDonazione,
  donazione,
  richiedeService,
  service,
  richiedeConsumabili,
  consumabili,
  budget
}): ValidationResult {
  // Blocca: donazione + service con consumabili dedicati
  // Blocca: donazione + materiali dedicati
  // Warning: duplicazione service + consumabili
}
```

### 3. Workflow Manager (`lib/workflow.ts`)

#### Macchina a Stati

Ogni Track ha il proprio workflow definito:

**Track 1 - Urgenza Critica:**
```
SOTTOMESSA
  → IN_TRIAGE (CoordCommAz)
  → ASSEGNATO_TRACK (CoordCommAz + DS)
  → IN_APPROVAZIONE_DA (DA)
  → APPROVATA (DA)
```

**Track 2 - Fast Track:**
```
SOTTOMESSA
  → IN_VALIDAZIONE_DIPARTIMENTO (Direttore)
  → IN_PRESCREENING (CoordCommAz)
  → IN_APPROVAZIONE_DA (DS/DA)
  → APPROVATA (DA)
```

**Track 3 - Semplificata:**
```
SOTTOMESSA
  → IN_VALIDAZIONE_DIPARTIMENTO (Direttore)
  → IN_PRESCREENING (CoordCommAz)
  → IN_VALUTAZIONE_COMMAZ (CommAz ristretta)
  → IN_APPROVAZIONE_DA (DS/DA)
  → APPROVATA (DA)
```

**Track 4 - HTA Completo:**
```
SOTTOMESSA
  → IN_PRESCREENING (CoordCommAz)
  → IN_VALUTAZIONE_COMMAZ (CommAz completa + audizioni)
  → IN_APPROVAZIONE_DS (DS ratifica)
  → IN_APPROVAZIONE_DA (DA autorizza)
  → APPROVATA (DA)
```

#### Transizioni Workflow

```typescript
interface WorkflowTransition {
  fromStatus: RequestStatus;
  toStatus: RequestStatus;
  requiredRole: UserRole[];
  validationFunction?: (request) => boolean;
  description: string;
}

// Definizione completa per ogni track
WORKFLOW_TRANSITIONS: Record<TrackType, WorkflowTransition[]>
```

#### Funzioni Workflow

```typescript
// Verifica permessi
canExecuteTransition(user: User, request: TechnologyRequest, toStatus: RequestStatus): boolean

// Esegui transizione
executeTransition(request, user, toStatus, note?): TechnologyRequest

// Approva/Respingi/Rinvia
approveRequest(request, user, note?): TechnologyRequest
rejectRequest(request, user, motivazione): TechnologyRequest
returnRequest(request, user, motivazione): TechnologyRequest

// Ottieni prossimi stati possibili
getNextStatuses(request, user): { status, description, canExecute }[]

// Analytics workflow
calculateWorkflowStats(requests): {
  avgDaysPerTrack,
  avgDaysPerStatus,
  bottlenecks
}
```

## Presentation Layer

### Component Architecture

```
src/components/
├── dashboard/
│   └── Dashboard.tsx          # Main dashboard con KPI
├── forms/
│   └── RequestForm.tsx        # Form multi-step richieste
└── shared/
    ├── Badge.tsx              # Badge stati/track
    ├── Card.tsx               # Card wrapper
    └── Alert.tsx              # Alert componente
```

### Dashboard Components

#### Dashboard.tsx

**Responsabilità:**
- Visualizzazione KPI real-time
- Grafici distribuzione per track
- Alert richieste in ritardo
- Tabella richieste recenti
- Budget overview

**Props:**
```typescript
interface DashboardProps {
  requests: TechnologyRequest[];
}
```

**Computed Stats:**
```typescript
interface DashboardStats {
  richiesteInCorso: number;
  richiesteCompletateUltimoMese: number;
  tempoMedioApprovazione: number;
  richiestePerTrack: { track: TrackType; count: number }[];
  richiestePerStato: { stato: RequestStatus; count: number }[];
  alertTempiScadenza: TechnologyRequest[];
  budgetUtilizzato: number;
  budgetDisponibile: number;
}
```

### Form Components

#### RequestForm.tsx

**Multi-Step Form:**

1. **Step 1 - Dati Base**
   - Unità Operativa, Dipartimento
   - Tipo Acquisto, Tipo Apparecchiatura
   - Dettagli Sostituzione (se applicabile)
   - Alert Donazione DGR 306/2024

2. **Step 2 - Apparecchiatura**
   - Nome, Descrizione, Caratteristiche tecniche
   - Motivazione, Impatto assistenziale
   - Flag adeguamenti strutturali

3. **Step 3 - Budget**
   - Valore stimato, Fonte finanziamento
   - Budget disponibile, Richiesta integrazione
   - Validazione USL PM

4. **Step 4 - Service/Consumabili**
   - Service: dati contratto, consumabili inclusi
   - Consumabili: tipo, fornitore, consumo annuo
   - Validazioni DGR 306/2024 in real-time

5. **Step 5 - Revisione**
   - Riepilogo completo
   - Risultato triage automatico
   - Warning e errori validazione
   - Conferma invio

**Validazione Progressive:**
```typescript
// Ad ogni step, validazioni specifiche
// Al submit finale, validazione completa

const handleSubmit = () => {
  const triage = eseguiTriage(formData);
  const validation = validaCoerenzaRichiesta(formData);

  if (validation.errors.length > 0) {
    showErrors(validation.errors);
    return;
  }

  showWarnings(validation.warnings);
  submitRequest(formData, triage);
};
```

## Data Flow

### Ciclo di Vita Richiesta

```
1. CREAZIONE
   User → RequestForm → eseguiTriage() → Track assegnato

2. VALIDAZIONE
   Form → validaDGR306_2024()
       → validaServiceContract()
       → validaConsumabili()
       → validaBudget()
       → validaCoerenzaRichiesta()

3. SUBMIT
   Form → POST /api/requests
       → Database insert
       → Notifica Coordinatore CommAz

4. WORKFLOW
   CoordCommAz → executeTransition(IN_TRIAGE → ASSEGNATO_TRACK)
   Direttore   → executeTransition(... → IN_VALIDAZIONE)
   ...
   DA          → approveRequest() → APPROVATA

5. COMPLETAMENTO
   USL TS → invio ESTAR → COMPLETATA
```

### State Management (Future)

Per implementazione con backend:

```typescript
// Zustand store example
interface RequestStore {
  requests: TechnologyRequest[];
  currentRequest: TechnologyRequest | null;

  // Actions
  fetchRequests: () => Promise<void>;
  createRequest: (data: Partial<TechnologyRequest>) => Promise<void>;
  updateRequest: (id: string, data: Partial<TechnologyRequest>) => Promise<void>;
  approveRequest: (id: string, userId: string, note?: string) => Promise<void>;
  rejectRequest: (id: string, userId: string, motivazione: string) => Promise<void>;
}
```

## Security & Authorization

### Role-Based Access Control (RBAC)

```typescript
// Matrice permessi
const PERMISSIONS: Record<UserRole, string[]> = {
  RESPONSABILE_UO: ['create_request', 'view_own_requests'],
  DIRETTORE_DIPARTIMENTO: ['validate_request', 'view_department_requests'],
  COORDINATORE_COMMAZ: ['triage', 'prescreening', 'view_all_requests'],
  DIREZIONE_AMMINISTRATIVA: ['approve_final', 'reject', 'view_all_requests'],
  // ...
};

// Check permesso
function hasPermission(user: User, permission: string): boolean {
  return PERMISSIONS[user.ruolo]?.includes(permission) || false;
}
```

### Audit Trail

Ogni modifica registrata in `storico`:

```typescript
interface HistoryEntry {
  id: string;
  data: Date;
  utenteId: string;
  utente: User;
  azione: string;
  statoPrec?: RequestStatus;
  statoNuovo?: RequestStatus;
  note?: string;
  campiModificati?: string[];
}
```

## Performance Considerations

### Ottimizzazioni Client-Side

1. **Lazy Loading Components**
```typescript
const Dashboard = dynamic(() => import('@/components/dashboard/Dashboard'), {
  loading: () => <Skeleton />
});
```

2. **Memoization**
```typescript
const stats = useMemo(() => calculateDashboardStats(requests), [requests]);
```

3. **Virtual Scrolling** (per liste lunghe)
```typescript
// React Window per tabelle con 1000+ righe
import { FixedSizeList } from 'react-window';
```

### Ottimizzazioni Future (Backend)

1. **Caching**
   - Redis per sessioni utente
   - Cache query frequenti
   - Invalidazione selettiva

2. **Database Indexing**
```sql
CREATE INDEX idx_requests_status ON requests(stato_corrente);
CREATE INDEX idx_requests_track ON requests(track_assegnato);
CREATE INDEX idx_requests_date ON requests(data_creazione DESC);
```

3. **Pagination & Filtering**
```typescript
// API endpoint
GET /api/requests?page=1&limit=20&track=TRACK_2&status=IN_VALIDAZIONE
```

## Testing Strategy

### Unit Tests

```typescript
// triage.test.ts
describe('eseguiTriage', () => {
  it('assegna Track 1 per safety critica', () => {
    const richiesta = {
      motivazioneRichiesta: 'rischio paziente safety critica'
    };
    const result = eseguiTriage(richiesta);
    expect(result.trackAssegnato).toBe(TrackType.URGENZA_CRITICA);
  });
});

// validations.test.ts
describe('validaDGR306_2024', () => {
  it('blocca donazioni con materiali dedicati', () => {
    const donazione = { materialiUsoDecicati: true };
    const result = validaDGR306_2024(donazione);
    expect(result.isValid).toBe(false);
  });
});
```

### Integration Tests

```typescript
// workflow.test.ts
describe('Workflow completo Track 2', () => {
  it('completa Fast Track in 7 giorni', async () => {
    // Setup richiesta
    // Simula approvazioni successive
    // Verifica tempo totale <= 7 giorni
  });
});
```

## Deployment

### Production Build

```bash
npm run build
# Output: .next/

npm start
# Server production su porta 3000
```

### Environment Variables

```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.gestionale-ts.example.com
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.example.com
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./.next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

## Extensibility Points

### 1. Custom Validators

```typescript
// lib/validations.ts
export function validaCustom(data: any): ValidationResult {
  // Implementa logica specifica
}
```

### 2. Custom Triage Rules

```typescript
// lib/triage.ts
function verificaCriterioCustom(richiesta): boolean {
  // Aggiungi nuovo criterio
}
```

### 3. Plugin System (Future)

```typescript
interface Plugin {
  name: string;
  onRequestCreate?: (req: TechnologyRequest) => void;
  onRequestUpdate?: (req: TechnologyRequest) => void;
  onStateChange?: (from: RequestStatus, to: RequestStatus) => void;
}
```

## Monitoring & Observability

### Metrics da Tracciare

```typescript
// KPI Sistema
- Richieste create/giorno
- Tempo medio per track
- Tasso approvazione/rifiuto
- Richieste in ritardo
- Budget allocato

// Performance
- Page load time
- API response time
- Database query time

// Errors
- Validation errors rate
- Failed transitions
- System errors
```

### Logging

```typescript
// Structured logging
logger.info('Request created', {
  requestId: req.id,
  track: req.trackAssegnato,
  userId: user.id
});

logger.warn('Request in ritardo', {
  requestId: req.id,
  giorniRitardo: Math.abs(calcolaGiorniResidui(req))
});
```

---

**Versione Architettura**: 1.0
**Ultimo Aggiornamento**: 2025
