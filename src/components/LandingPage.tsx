'use client';

import React from 'react';
import { FileText, Zap, CheckCircle, TrendingUp, AlertTriangle, ArrowRight, Shield, Clock, Users } from 'lucide-react';

interface LandingPageProps {
  onEnterSystem: () => void;
}

export function LandingPage({ onEnterSystem }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <img
              src="/logo-usl-tno.png"
              alt="USL Toscana Nord Ovest"
              className="h-20 w-auto object-contain"
              onError={(e) => {
                // Fallback to icon if logo not found
                e.currentTarget.style.display = 'none';
                const icon = e.currentTarget.nextElementSibling;
                if (icon) icon.classList.remove('hidden');
              }}
            />
            <FileText className="w-10 h-10 text-blue-600 hidden" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestionale Tecnologie Sanitarie
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                USL Toscana Nord Ovest - Dipartimento Tecnico
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema Multi-Track per HTA
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Piattaforma integrata per la gestione delle richieste di tecnologie sanitarie
            con 4 livelli di urgenza e tempi certi di risposta
          </p>
          <button
            onClick={onEnterSystem}
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Shield className="w-6 h-6" />
            Accedi al Sistema
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Track 1 */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-red-600 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Track 1</h3>
                <p className="text-xs text-gray-600">Urgenza Critica</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
              <Clock className="w-4 h-4" />
              <span>24-48 ore</span>
            </div>
            <p className="text-sm text-gray-600">
              Safety critica, blocco servizi essenziali, obblighi normativi urgenti
            </p>
          </div>

          {/* Track 2 */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-orange-600 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Track 2</h3>
                <p className="text-xs text-gray-600">Fast Track</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-600 font-semibold mb-2">
              <Clock className="w-4 h-4" />
              <span>5-7 giorni</span>
            </div>
            <p className="text-sm text-gray-600">
              Sostituzioni 1:1, urgenze con workaround, sotto soglia €15K
            </p>
          </div>

          {/* Track 3 */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-yellow-600 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Track 3</h3>
                <p className="text-xs text-gray-600">Semplificata</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-yellow-600 font-semibold mb-2">
              <Clock className="w-4 h-4" />
              <span>15-20 giorni</span>
            </div>
            <p className="text-sm text-gray-600">
              Donazioni &lt;€50K, ampliamenti dotazione, upgrade programmabili
            </p>
          </div>

          {/* Track 4 */}
          <div className="bg-white rounded-lg shadow-md border-l-4 border-blue-600 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Track 4</h3>
                <p className="text-xs text-gray-600">HTA Completo</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
              <Clock className="w-4 h-4" />
              <span>30-45 giorni</span>
            </div>
            <p className="text-sm text-gray-600">
              Nuove tecnologie, alto impatto, investimenti &gt;€100K
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Caratteristiche Principali
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Coordinatore CommAz</h4>
              <p className="text-sm text-gray-600">
                Triage centralizzato e assegnazione track da parte del Coordinatore
                della Commissione Aziendale
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Conformità Normativa</h4>
              <p className="text-sm text-gray-600">
                Conforme a DGR 306/2024 (donazioni), DGR 737/2022 (tecnologie innovative)
                e Procedura TS aziendale
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Moduli Differenziati</h4>
              <p className="text-sm text-gray-600">
                4 tipi di moduli: MOD.01 (generale), MOD.02 (ecografi),
                Fast Track e Semplificato
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Pronto per iniziare?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Accedi al sistema per compilare richieste, consultare lo storico,
            visualizzare il listino prezzi e monitorare lo stato delle pratiche
          </p>
          <button
            onClick={onEnterSystem}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg"
          >
            <Shield className="w-6 h-6" />
            Accedi al Sistema
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Sistema Multi-Track HTA - Conforme a Procedura TS + DGR 306/2024 + DGR 737/2022
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            Azienda USL Toscana Nord Ovest - Dipartimento Tecnico - UOC Tecnologie
          </p>
        </div>
      </footer>
    </div>
  );
}
