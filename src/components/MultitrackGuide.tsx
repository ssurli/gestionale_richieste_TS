'use client';

import React from 'react';
import { Clock, AlertTriangle, Zap, CheckCircle, TrendingUp, Users, FileText, ArrowRight } from 'lucide-react';

export function MultitrackGuide() {
  const tracks = [
    {
      id: 1,
      name: 'URGENZA CRITICA',
      time: '24-48 ore',
      color: 'bg-red-600',
      borderColor: 'border-red-600',
      bgLight: 'bg-red-50',
      icon: AlertTriangle,
      criteria: [
        'Safety critica per pazienti o operatori',
        'Blocco servizio essenziale (PS, Rianimazione, Sala Operatoria)',
        'Obbligo normativo urgente con scadenza imminente'
      ],
      workflow: 'Richiesta → Triage → Coordinatore CommAz → Direttore Sanitario → Ordine',
      example: 'Guasto ventilatore polmonare in Terapia Intensiva - necessaria sostituzione immediata'
    },
    {
      id: 2,
      name: 'FAST TRACK',
      time: '5-7 giorni',
      color: 'bg-orange-600',
      borderColor: 'border-orange-600',
      bgLight: 'bg-orange-50',
      icon: Zap,
      criteria: [
        'Sostituzione 1:1 di attrezzatura esistente',
        'Valore <€15.000',
        'Convenzione ESTAR attiva',
        'Manutenzione ordinaria o service attivo'
      ],
      workflow: 'Richiesta → Triage → Responsabile HTA → Direttore Amministrativo → Ordine',
      example: 'Sostituzione ECG carrellato rotto, stesso modello in convenzione ESTAR'
    },
    {
      id: 3,
      name: 'SEMPLIFICATA',
      time: '15-20 giorni',
      color: 'bg-yellow-600',
      borderColor: 'border-yellow-600',
      bgLight: 'bg-yellow-50',
      icon: CheckCircle,
      criteria: [
        'Donazione con valore <€50.000',
        'Conforme a DGR 306/2024 (no materiali dedicati)',
        'Espansione dotazione esistente (non nuova tecnologia)',
        'Aggiornamento tecnologico su base già presente'
      ],
      workflow: 'Richiesta → Triage → CommAz → Direzione Sanitaria → Direzione Amministrativa → Ordine',
      example: 'Donazione 3 monitor multiparametrici per reparto cardiologia, marca già in uso'
    },
    {
      id: 4,
      name: 'HTA COMPLETO',
      time: '30-45 giorni',
      color: 'bg-blue-600',
      borderColor: 'border-blue-600',
      bgLight: 'bg-blue-50',
      icon: TrendingUp,
      criteria: [
        'Nuova tecnologia mai utilizzata in azienda',
        'Alto impatto organizzativo/clinico',
        'Investimento >€100.000',
        'Donazione >€50.000',
        'Richiede valutazione HTA completa'
      ],
      workflow: 'Richiesta → Triage → UO → Dipartimento → CommAz HTA → Dir. Sanitaria → Dir. Amministrativa → Ordine',
      example: 'Introduzione robot chirurgico Da Vinci per chirurgia mini-invasiva - investimento €1.8M'
    }
  ];

  const states = [
    { name: 'SOTTOMESSA', desc: 'Richiesta inviata' },
    { name: 'IN_TRIAGE', desc: 'Sistema assegna Track' },
    { name: 'IN_VALUTAZIONE_UO', desc: 'Raccolta info aggiuntive' },
    { name: 'IN_VALUTAZIONE_DIPARTIMENTO', desc: 'Parere tecnico' },
    { name: 'IN_COMMISSIONE_HTA', desc: 'Valutazione multidisciplinare' },
    { name: 'IN_VALUTAZIONE_DS', desc: 'Direzione Sanitaria' },
    { name: 'IN_VALUTAZIONE_DA', desc: 'Direzione Amministrativa' },
    { name: 'APPROVATA', desc: 'Approvata per procurement' },
    { name: 'IN_PROCUREMENT', desc: 'Gara/trattativa/ordine' },
    { name: 'COMPLETATA', desc: 'Processo concluso' }
  ];

  const roles = [
    {
      name: 'Richiedente',
      subtitle: '(Medico/Infermiere)',
      responsibilities: [
        'Compilare il modulo (MOD.01 o MOD.02)',
        'Fornire dati tecnici e giustificazione clinica',
        'Rispondere a richieste di integrazione'
      ]
    },
    {
      name: 'Direttore U.O.',
      subtitle: '',
      responsibilities: [
        'Autorizzare la richiesta con firma',
        'Validare la priorità indicata',
        'Garantire sostenibilità organizzativa'
      ]
    },
    {
      name: 'Responsabile HTA',
      subtitle: '(Dipartimento Tecnico)',
      responsibilities: [
        'Coordinare il processo di triage',
        'Assegnare il Track appropriato',
        'Supervisionare la valutazione tecnica'
      ]
    },
    {
      name: 'Commissione Aziendale',
      subtitle: '',
      responsibilities: [
        'Valutazione multidisciplinare HTA completo',
        'Analisi costi-benefici per acquisti rilevanti',
        'Verifica conformità DGR 306/2024 per donazioni'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema Multi-Track HTA</h1>
          <p className="text-lg text-gray-600">
            Guida al sistema di gestione delle richieste di tecnologie sanitarie
          </p>
          <p className="text-sm text-gray-500 mt-2">
            USL Toscana Nord Ovest - Dipartimento Tecnico
          </p>
        </div>

        {/* Overview Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-600">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Panoramica del Sistema
          </h2>
          <p className="text-gray-700 mb-4">
            Il <strong>Gestionale Tecnologie Sanitarie</strong> è un sistema completo per la gestione
            delle richieste di acquisto, sostituzione e aggiornamento di attrezzature sanitarie,
            conforme alla normativa vigente (DGR 306/2024, DGR 737/2022).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">4 Livelli di Urgenza</p>
                <p className="text-sm text-gray-600">Da 24 ore a 45 giorni in base alla criticità</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">Triage Automatico</p>
                <p className="text-sm text-gray-600">Assegnazione intelligente del percorso</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">Moduli Ufficiali</p>
                <p className="text-sm text-gray-600">MOD.01 (generale) e MOD.02 (ecografi)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">Catalogo ESTAR</p>
                <p className="text-sm text-gray-600">Suggerimenti prezzi in tempo reale</p>
              </div>
            </div>
          </div>
        </div>

        {/* Track Cards */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          I 4 Track del Sistema
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {tracks.map((track) => {
            const Icon = track.icon;
            return (
              <div
                key={track.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${track.borderColor}`}
              >
                <div className={`${track.color} px-6 py-4`}>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6" />
                      <div>
                        <h3 className="text-lg font-bold">Track {track.id}: {track.name}</h3>
                        <p className="text-sm opacity-90 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {track.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Criteri */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Criteri di accesso:</h4>
                    <ul className="space-y-1">
                      {track.criteria.map((criterion, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className={`w-1.5 h-1.5 ${track.color} rounded-full mt-1.5 flex-shrink-0`}></span>
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Workflow */}
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Workflow:</h4>
                    <p className="text-xs text-gray-600 font-mono">{track.workflow}</p>
                  </div>

                  {/* Example */}
                  <div className={`p-3 ${track.bgLight} rounded border ${track.borderColor}`}>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Esempio:</h4>
                    <p className="text-sm text-gray-700 italic">&quot;{track.example}&quot;</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflow States */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowRight className="w-6 h-6 text-blue-600" />
            Flusso degli Stati
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Ogni richiesta attraversa una serie di stati dal momento della sottomissione fino al completamento.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {states.map((state, idx) => (
              <div key={idx} className="relative">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-xs">{state.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{state.desc}</p>
                </div>
                {idx < states.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Stati di Eccezione:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold">❌</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">RESPINTA</p>
                  <p className="text-xs text-gray-600">Non approvata (motivazione obbligatoria)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">⏸️</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">SOSPESA</p>
                  <p className="text-xs text-gray-600">In attesa integrazioni</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">🔄</span>
                <div>
                  <p className="font-semibold text-sm text-gray-900">RIASSEGNATA</p>
                  <p className="text-xs text-gray-600">Cambiato Track dopo rivalutazione</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Ruoli e Responsabilità
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-1">
                  {role.name} {role.subtitle && <span className="text-sm text-gray-600 font-normal">{role.subtitle}</span>}
                </h3>
                <ul className="mt-3 space-y-2">
                  {role.responsibilities.map((resp, ridx) => (
                    <li key={ridx} className="text-sm text-gray-700 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Questa è una sintesi del sistema Multi-Track. Per maggiori dettagli
            consulta il documento completo <strong>WORKFLOW.md</strong> nella documentazione del progetto.
          </p>
        </div>
      </div>
    </div>
  );
}
