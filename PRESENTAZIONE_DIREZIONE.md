# Presentazione alla Direzione
## Sistema Gestionale Tecnologie Sanitarie - Demo Funzionante
**USL Toscana Nord Ovest**
**Data:** 29 Dicembre 2025

---

## 🎯 Obiettivo della Presentazione

Presentare il **sistema digitale di gestione richieste tecnologie sanitarie** già **funzionante e online**, che implementa il **Regolamento Aziendale rev. 26-12-2025** approvato dal Gruppo di Lavoro.

---

## ✅ Stato Attuale: SISTEMA ONLINE E OPERATIVO

### Demo Live
🔗 **URL:** [Vercel Deployment - gestionale-richieste-ts.vercel.app]

Il sistema è **già deployato** e può essere dimostrato **in tempo reale** alla Direzione.

---

## 📋 Allineamento con Regolamento Aziendale

### Implementazione Digitale Completa

Il sistema implementa **al 100%** il regolamento aziendale "terranova" (rev. 26-12-2025):

| Elemento Regolamento | Implementazione Digitale | Stato |
|---------------------|-------------------------|-------|
| **Track 1 - Urgenza Critica** (24-48h) | MOD.01/MOD.02 digitali | ✅ OPERATIVO |
| **Track 2 - Fast Track** (5-7 gg) | **Allegato 2** → Form digitale | ✅ OPERATIVO |
| **Track 3 - Basso Impatto** (15-20 gg) | **Allegato 3** → Form digitale | ✅ OPERATIVO |
| **Track 4 - HTA Completo** (30-45 gg) | MOD.01/MOD.02 digitali | ✅ OPERATIVO |

### Moduli Digitalizzati

**Allegato 2 - Fast Track:**
- ✅ 7 Casistiche (A-G): Sostituzione 1:1, urgenza workaround, upgrade obbligato, sotto soglia, prove, service, consumabili
- ✅ Campi: Direttore UO, Matricola, Anno installazione, Motivo dismissione
- ✅ **Impatto Continuità Assistenziale** (CRITICO/ALTO/MEDIO/BASSO)
- ✅ Validazione automatica DGR 306/2024

**Allegato 3 - Semplificata:**
- ✅ 3 Casistiche: Donazioni, Ampliamenti, Upgrade
- ✅ Campi: Direttore UO, Dipartimento/Area, Tipologia donatore
- ✅ **Già aggiudicata ESTAR?** con N° Determinazione
- ✅ Alert automatici per soglie (€50K, materiali dedicati)

---

## 💡 Vantaggi Rispetto ai Moduli Cartacei

### 1. Automazione e Compliance
- ✅ **Validazione in tempo reale** DGR 306/2024 e DGR 737/2022
- ✅ **Alert automatici** se richiesta supera soglie (es. donazione ≥€50K → Track 4)
- ✅ **Calcolo automatico** impatto continuità assistenziale

### 2. Tracciabilità Completa
- ✅ Ogni richiesta ha **ID univoco** e **timestamp**
- ✅ **Storico completo** delle modifiche
- ✅ **Dashboard** per Coordinatore CommAz con overview richieste

### 3. Efficienza Operativa
- ✅ **No carta**: moduli compilabili online da qualsiasi device
- ✅ **Suggerimenti ESTAR** in tempo reale (88 ordini storici)
- ✅ **Listino prezzi** integrato per verifiche economiche

### 4. Integrazione Dati
- ✅ **106 richieste pregresse** già nel sistema
- ✅ **88 ordinativi ESTAR** come riferimento prezzi
- ✅ **Catalogo dispositivi** con codici e specifiche

---

## 🚀 Roadmap: Integrazione Mini-HTA UniPisa

### Contesto
L'**Università di Pisa (CIRHTA)** ha sviluppato un software **mini-HTA gratuito** per aziende SSR Toscana.

### Stato
- 📅 **Workshop presentazione**: 13 Giugno 2025
- 🔗 **Contatto**: segret_cirhta@dam.unipi.it
- 💰 **Costo**: Gratuito per USL Toscana

### Piano Integrazione
1. **Q1 2025**: Contatto CIRHTA per accesso beta
2. **Q2 2025**: Valutazione integrazione mini-HTA come **modulo di scoring** per Track 4 (HTA Completo)
3. **Q3 2025**: Eventuale deploy mini-HTA integrato

**Architettura proposta:**
```
Nostro Sistema (Frontend + Gestione)
         ↓
   Mini-HTA UniPisa (Valutazione & Scoring)
         ↓
   Report HTA automatici per Track 4
```

---

## 📊 Confronto: Proposta Terranova vs Sistema Digitale

| Aspetto | Proposta Terranova (cartaceo) | Sistema Digitale | Vantaggio |
|---------|------------------------------|------------------|-----------|
| **Moduli** | Word/Excel (.doc) | Form web digitali | ✅ Accessibilità |
| **Validazione** | Manuale | Automatica (DGR) | ✅ Compliance |
| **Tracking** | Email/cartelle | Database + Dashboard | ✅ Tracciabilità |
| **Prezzi** | Ricerca manuale ESTAR | Listino integrato | ✅ Efficienza |
| **Storico** | Archivio fisico | Database consultabile | ✅ Analytics |
| **Accesso** | Ufficio | Ovunque (web) | ✅ Flessibilità |

---

## 🎬 Demo Live - Punti Chiave da Mostrare

### 1. Landing Page (2 min)
- Logo USL Toscana Nord Ovest
- Overview 4 Track con tempi
- "Accedi al Sistema" → Dashboard

### 2. Dashboard (3 min)
- Panoramica richieste
- Bottoni colorati per ogni Track
- Accesso rapido a: MOD.01, MOD.02, Fast Track, Semplificato, Listino

### 3. Modulo Fast Track (5 min)
**Scenario:** Sostituzione ECG fuori uso
- ✅ Compilazione campi Allegato 2
- ✅ Selezione categoria "A - Sostituzione 1:1"
- ✅ Impatto continuità: "ALTO"
- ✅ Riferimenti ESTAR automatici
- ✅ Submit → conferma presa in carico

### 4. Modulo Semplificato (5 min)
**Scenario:** Donazione defibrillatore €30.000
- ✅ Compilazione campi Allegato 3
- ✅ Categoria "Donazione"
- ✅ Tipologia donatore: "Associazione"
- ✅ **Alert automatico**: "OK sotto €50K, conforme DGR 306/2024"
- ✅ Submit

### 5. Listino Storico ESTAR (2 min)
- 88 ordini storici consultabili
- Ricerca per keyword (es. "ecografo")
- Prezzi in formato italiano (1.234,56 €)

---

## 💼 Decisioni Richieste alla Direzione

### 1. Approvazione Sistema
- ✅ **Approvare** l'uso del sistema digitale come implementazione ufficiale del Regolamento Aziendale
- ✅ **Confermare** equivalenza moduli digitali ↔ Allegati 2/3/4 cartacei

### 2. Rollout
- 📅 **Fase Pilota**: Gennaio 2025 con 2-3 UU.OO. selezionate
- 📅 **Go-Live Aziendale**: Marzo 2025

### 3. Integrazione Mini-HTA
- ✅ **Autorizzare** contatto con CIRHTA UniPisa per accesso beta
- ✅ **Valutare** integrazione mini-HTA per Track 4 (Q2 2025)

---

## 📞 Contatti e Supporto

**Referente Progetto:**
UOC Tecnologie Sanitarie ESTAR - USL Toscana Nord Ovest

**Supporto Tecnico:**
Sistema deployato su Vercel (99.9% uptime)

**CIRHTA UniPisa (Mini-HTA):**
📧 segret_cirhta@dam.unipi.it
🌐 [http://cirhta.unipi.it/](http://cirhta.unipi.it/)

---

## 🏁 Conclusioni

### Punti di Forza
1. ✅ **Sistema già funzionante** e online (no sviluppo da zero)
2. ✅ **100% allineato** con Regolamento Aziendale terranova
3. ✅ **Automazione compliance** DGR 306/2024 e DGR 737/2022
4. ✅ **Tracciabilità completa** e dashboard analytics
5. ✅ **Integrabile** con mini-HTA UniPisa (gratuito)

### Prossimi Passi
1. **Oggi**: Approvazione Direzione
2. **Gennaio 2025**: Fase pilota
3. **Febbraio 2025**: Contatto CIRHTA per mini-HTA
4. **Marzo 2025**: Go-live aziendale

---

**Il sistema è PRONTO. Attendiamo solo l'approvazione per il deployment aziendale.**
