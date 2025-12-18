'use client';

import React, { useState, useEffect } from 'react';
import {
  TechnologyRequest,
  TrackType,
  RequestStatus,
  DashboardStats,
  TRACK_CONFIGS
} from '@/types';
import { calcolaGiorniResidui, isInRitardo } from '@/lib/triage';
import { Clock, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  requests: TechnologyRequest[];
}

export function Dashboard({ requests }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    calculateStats();
  }, [requests]);

  const calculateStats = () => {
    const richiesteInCorso = requests.filter(
      r => r.statoCorrente !== RequestStatus.COMPLETATA &&
          r.statoCorrente !== RequestStatus.RESPINTA
    ).length;

    const richiesteCompletateUltimoMese = requests.filter(r => {
      if (!r.dataUltimaModifica) return false;
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(r.dataUltimaModifica) >= oneMonthAgo &&
             r.statoCorrente === RequestStatus.COMPLETATA;
    }).length;

    const tempiApprovazione = requests
      .filter(r => r.statoCorrente === RequestStatus.APPROVATA && r.dataAssegnazioneTrack)
      .map(r => {
        const giorni = Math.floor(
          (new Date().getTime() - new Date(r.dataAssegnazioneTrack!).getTime()) /
          (1000 * 60 * 60 * 24)
        );
        return giorni;
      });

    const tempoMedioApprovazione = tempiApprovazione.length > 0
      ? tempiApprovazione.reduce((a, b) => a + b, 0) / tempiApprovazione.length
      : 0;

    const richiestePerTrack = Object.values(TrackType).map(track => ({
      track,
      count: requests.filter(r => r.trackAssegnato === track).length
    }));

    const richiestePerStato = Object.values(RequestStatus).map(stato => ({
      stato,
      count: requests.filter(r => r.statoCorrente === stato).length
    }));

    const alertTempiScadenza = requests.filter(r =>
      r.trackAssegnato &&
      r.statoCorrente !== RequestStatus.COMPLETATA &&
      r.statoCorrente !== RequestStatus.RESPINTA &&
      isInRitardo(r)
    );

    const budgetTotaleRichiesto = requests.reduce((sum, r) =>
      sum + (r.budget?.valoreStimatoEuro || 0), 0
    );

    const budgetApprovato = requests
      .filter(r => r.statoCorrente === RequestStatus.APPROVATA)
      .reduce((sum, r) => sum + (r.budget?.valoreStimatoEuro || 0), 0);

    setStats({
      richiesteInCorso,
      richiesteCompletateUltimoMese,
      tempoMedioApprovazione,
      richiestePerTrack,
      richiestePerStato,
      alertTempiScadenza,
      budgetUtilizzato: budgetApprovato,
      budgetDisponibile: budgetTotaleRichiesto - budgetApprovato
    });
  };

  if (!stats) return <div>Caricamento...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Gestionale Tecnologie Sanitarie
        </h1>
        <p className="text-gray-600 mt-2">
          Sistema Multi-Track per Health Technology Assessment
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Richieste in Corso"
          value={stats.richiesteInCorso}
          icon={<Clock className="w-8 h-8 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Completate Ultimo Mese"
          value={stats.richiesteCompletateUltimoMese}
          icon={<CheckCircle className="w-8 h-8 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Tempo Medio Approvazione"
          value={`${Math.round(stats.tempoMedioApprovazione)} gg`}
          icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
          color="purple"
        />
        <StatCard
          title="Alert Scadenze"
          value={stats.alertTempiScadenza.length}
          icon={<AlertTriangle className="w-8 h-8 text-red-600" />}
          color="red"
        />
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Budget Totale Richiesto</p>
            <p className="text-2xl font-bold text-gray-900">
              €{stats.budgetUtilizzato.toLocaleString('it-IT')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget Disponibile</p>
            <p className="text-2xl font-bold text-green-600">
              €{stats.budgetDisponibile.toLocaleString('it-IT')}
            </p>
          </div>
        </div>
      </div>

      {/* Track Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Distribuzione per Track</h2>
        <div className="space-y-4">
          {stats.richiestePerTrack.map(({ track, count }) => {
            const config = TRACK_CONFIGS[track];
            return (
              <div key={track} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: config.colore }}
                  />
                  <span className="font-medium">{config.nome}</span>
                  <span className="text-sm text-gray-500">
                    ({config.tempoMassimoGiorni} gg max)
                  </span>
                </div>
                <span className="font-bold text-lg">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {stats.alertTempiScadenza.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Richieste in Ritardo
          </h2>
          <div className="space-y-3">
            {stats.alertTempiScadenza.map(req => (
              <div
                key={req.id}
                className="bg-white rounded p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{req.nomeApparecchiatura}</p>
                  <p className="text-sm text-gray-600">
                    {req.unitaOperativa} - {req.numeroProgressivo}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-bold">
                    {Math.abs(calcolaGiorniResidui(req))} giorni di ritardo
                  </p>
                  <p className="text-sm text-gray-600">
                    Track: {req.trackAssegnato && TRACK_CONFIGS[req.trackAssegnato].nome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Richieste Recenti</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Numero
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Apparecchiatura
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Track
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Stato
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Giorni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.slice(0, 10).map(req => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{req.numeroProgressivo}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {req.nomeApparecchiatura}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {req.trackAssegnato && (
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: TRACK_CONFIGS[req.trackAssegnato].colore + '20',
                          color: TRACK_CONFIGS[req.trackAssegnato].colore
                        }}
                      >
                        {TRACK_CONFIGS[req.trackAssegnato].nome}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{req.statoCorrente}</td>
                  <td className="px-4 py-3 text-sm">{req.giorniTrascorsi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    red: 'bg-red-50 border-red-200'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
