'use client';

import { useState } from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { RequestForm } from '@/components/forms/RequestForm';
import { TechnologyRequest } from '@/types';
import { FileText, LayoutDashboard, Plus } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'new-request'>('dashboard');
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
                  Sistema Multi-Track per HTA - Azienda Sanitaria
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('new-request')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentView === 'new-request'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Plus className="w-5 h-5" />
                Nuova Richiesta
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {currentView === 'dashboard' && <Dashboard requests={requests} />}
        {currentView === 'new-request' && <RequestForm />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Sistema Multi-Track HTA - Conforme a Procedura TS + DGR 306/2024 + DGR 737/2022
          </p>
        </div>
      </footer>
    </div>
  );
}
