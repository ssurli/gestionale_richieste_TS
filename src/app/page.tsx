'use client';

import { useState } from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { FormMOD01 } from '@/components/forms/FormMOD01';
import { FormMOD02 } from '@/components/forms/FormMOD02';
import { PriceList } from '@/components/PriceList';
import { TechnologyRequest } from '@/types';
import { FileText, LayoutDashboard, Plus, Stethoscope, DollarSign } from 'lucide-react';
import priceListData from '../../price_list_data.json';

type ViewType = 'dashboard' | 'mod01' | 'mod02' | 'pricelist';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [requests, setRequests] = useState<TechnologyRequest[]>([]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestionale Tecnologie Sanitarie
                </h1>
                <p className="text-sm text-gray-600">
                  Sistema Multi-Track per HTA - Azienda Sanitaria USL Toscana Nord Ovest
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('mod01')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentView === 'mod01'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Plus className="w-4 h-4" />
                MOD.01
              </button>
              <button
                onClick={() => setCurrentView('mod02')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentView === 'mod02'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                MOD.02
              </button>
              <button
                onClick={() => setCurrentView('pricelist')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentView === 'pricelist'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Listino
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={currentView === 'dashboard' ? 'max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8' : ''}>
        {currentView === 'dashboard' && <Dashboard requests={requests} />}
        {currentView === 'mod01' && <FormMOD01 />}
        {currentView === 'mod02' && <FormMOD02 />}
        {currentView === 'pricelist' && <PriceList data={priceListData} />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Sistema Multi-Track HTA - Conforme a Procedura TS + DGR 306/2024 + DGR 737/2022
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            Azienda USL Toscana Nord Ovest - Dipartimento Tecnico - U.O. Tecnologie
          </p>
        </div>
      </footer>
    </div>
  );
}
