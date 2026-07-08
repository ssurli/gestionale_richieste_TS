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
import {
  codaPerTrack,
  aggregatoPerUnita,
  budgetAggregato,
  percentualeInRitardo,
  getSlaStatus,
  type SlaStatus,
} from '@/lib/sla';
import { formatEuro } from '@/lib/numberFormat';
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

    // Tempo di approvazione EFFETTIVO: da assegnazione track alla decisione DA
    // (non now(): quello cresceva indefinitamente falsando la media)
    const tempiApprovazione = requests
      .filter(r => r.statoCorrente === RequestStatus.APPROVATA && r.dataAssegnazioneTrack && r.dataApprovazioneDA)
      .map(r => Math.floor(
        (new Date(r.dataApprovazioneDA!).getTime() - new Date(r.dataAssegnazioneTrack!).getTime()) /
        (1000 * 60 * 60 * 24)
      ));

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

  const code = codaPerTrack(requests);
  const perUnita = aggregatoPerUnita(requests);
  const budget = budgetAggregato(requests);
  const percRitardo = percentualeInRitardo(requests);

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
          title="Aperte in Ritardo"
          value={`${stats.alertTempiScadenza.length} (${Math.round(percRitardo)}%)`}
          icon={<AlertTriangle className="w-8 h-8 text-red-600" />}
          color="red"
        />
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Budget</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Richiesto (totale)</p>
            <p className="text-2xl font-bold text-gray-900">{formatEuro(budget.richiestoTotale, false)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Approvato</p>
            <p className="text-2xl font-bold text-green-600">{formatEuro(budget.approvato, false)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">In valutazione</p>
            <p className="text-2xl font-bold text-blue-600">{formatEuro(budget.inValutazione, false)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Respinto</p>
            <p className="text-2xl font-bold text-gray-500">{formatEuro(budget.respinto, false)}</p>
          </div>
        </div>
      </div>

      {/* Scadenzario SLA per track */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Scadenzario SLA per Track</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Track</th>
                <th className="px-4 py-2 text-right font-semibold text-gray-700">Aperte</th>
                <th className="px-4 py-2 text-right font-semibold text-green-700">In tempo</th>
                <th className="px-4 py-2 text-right font-semibold text-amber-700">In scadenza</th>
                <th className="px-4 py-2 text-right font-semibold text-red-700">In ritardo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {code.map((c) => (
                <tr key={c.track}>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: TRACK_CONFIGS[c.track].colore }}
                        aria-hidden="true"
                      />
                      {TRACK_CONFIGS[c.track].nome}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-medium">{c.totaleAperte}</td>
                  <td className="px-4 py-2 text-right text-green-700">{c.inTempo}</td>
                  <td className="px-4 py-2 text-right text-amber-700">{c.inScadenza}</td>
                  <td className="px-4 py-2 text-right font-bold text-red-700">{c.inRitardo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista per UO / dipartimento */}
      {perUnita.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Per Unità Operativa / Dipartimento</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Dipartimento</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Unità Operativa</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-700">Aperte</th>
                  <th className="px-4 py-2 text-right font-semibold text-red-700">In ritardo</th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-700">Budget richiesto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {perUnita.slice(0, 15).map((r) => (
                  <tr key={`${r.dipartimento}-${r.unita}`}>
                    <td className="px-4 py-2">{r.dipartimento}</td>
                    <td className="px-4 py-2">{r.unita}</td>
                    <td className="px-4 py-2 text-right font-medium">{r.totaleAperte}</td>
                    <td className="px-4 py-2 text-right font-bold text-red-700">{r.inRitardo}</td>
                    <td className="px-4 py-2 text-right">{formatEuro(r.budgetRichiesto, false)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  SLA
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
                  <td className="px-4 py-3 text-sm">
                    <SlaBadge status={getSlaStatus(req)} residui={calcolaGiorniResidui(req)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface SlaBadgeProps {
  status: SlaStatus;
  residui: number;
}

/** Badge stato SLA con testo esplicito (non solo colore, per accessibilità) */
function SlaBadge({ status, residui }: SlaBadgeProps) {
  const config: Record<SlaStatus, { label: string; className: string }> = {
    IN_TEMPO: { label: `In tempo (${residui}gg)`, className: 'bg-green-100 text-green-800' },
    IN_SCADENZA: { label: `In scadenza (${residui}gg)`, className: 'bg-amber-100 text-amber-800' },
    IN_RITARDO: { label: `In ritardo (${Math.abs(residui)}gg)`, className: 'bg-red-100 text-red-800' },
    NON_APPLICABILE: { label: '—', className: 'bg-gray-100 text-gray-500' },
  };
  const { label, className } = config[status];
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>{label}</span>;
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
