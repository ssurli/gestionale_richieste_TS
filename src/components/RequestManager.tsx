'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, FileText, Building2, User, Phone, Mail, Calendar, Euro, ChevronDown, ChevronUp, Package } from 'lucide-react';

export interface PianoAcquistiItem {
  tipo_modulo: string;
  richiedente: string;
  telefono?: string;
  email?: string;
  unita_operativa?: string;
  reparto_presidio?: string;
  descrizione?: string;
  quantita?: number;
  caratteristiche_tecniche?: string;
  procedura_diagnosi?: string;
  prestazioni_annue?: string | number;
  motivo_acquisizione?: string;
  come_svolta_attualmente?: string;
  sostituisce_aggiorna?: string;
  tecnologie_stessa_tipologia?: string;
  specificare_quali?: string;
  miglioramenti_attesi?: string;
  risorse_necessarie?: string;
  tipologia_acquisto?: string;
  costo_iva_esclusa?: string;
  percentuale_iva?: number;
  importo_iva_inclusa?: string;
  durata_mesi_contratto?: number;
  progetto_finalizzato?: string;
  codice_progetto?: string;
  direttore?: string;
  data_richiesta?: string;
  autorizzazione?: string;
  copertura?: string;
  contratto?: string;
  ordine_si_no?: string;
  anno_ordine?: number;
  numero_ordine?: string;
  ordine_riferimenti?: string;
  note?: string;
  tipologia_trasduttori?: string;
}

interface RequestManagerProps {
  data: PianoAcquistiItem[];
}

export function RequestManager({ data }: RequestManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoModuloFilter, setTipoModuloFilter] = useState<string>('all');
  const [uoFilter, setUoFilter] = useState<string>('all');
  const [motivoFilter, setMotivoFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Extract unique values for filters
  const uniqueUO = useMemo(() => {
    const uos = new Set(data.map(item => item.unita_operativa).filter(Boolean));
    return Array.from(uos).sort();
  }, [data]);

  const uniqueMotivi = useMemo(() => {
    const motivi = new Set(data.map(item => item.motivo_acquisizione).filter(Boolean));
    return Array.from(motivi).sort();
  }, [data]);

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.descrizione?.toLowerCase().includes(searchLower) ||
        item.richiedente?.toLowerCase().includes(searchLower) ||
        item.unita_operativa?.toLowerCase().includes(searchLower) ||
        item.reparto_presidio?.toLowerCase().includes(searchLower);

      const matchesTipo = tipoModuloFilter === 'all' || item.tipo_modulo === tipoModuloFilter;
      const matchesUO = uoFilter === 'all' || item.unita_operativa === uoFilter;
      const matchesMotivo = motivoFilter === 'all' || item.motivo_acquisizione === motivoFilter;

      return matchesSearch && matchesTipo && matchesUO && matchesMotivo;
    });
  }, [data, searchTerm, tipoModuloFilter, uoFilter, motivoFilter]);

  // Statistics
  const stats = useMemo(() => {
    const mod01Count = filteredData.filter(r => r.tipo_modulo === 'MOD.01').length;
    const mod02Count = filteredData.filter(r => r.tipo_modulo === 'MOD.02').length;

    const totalQuantita = filteredData.reduce((sum, r) => sum + (r.quantita || 0), 0);

    const uniqueUOs = new Set(filteredData.map(r => r.unita_operativa).filter(Boolean)).size;

    return {
      total: filteredData.length,
      mod01: mod01Count,
      mod02: mod02Count,
      totalQuantita,
      uniqueUOs
    };
  }, [filteredData]);

  // Get status badge
  const getStatusBadge = (item: PianoAcquistiItem) => {
    if (item.ordine_si_no === 'Sì' || item.ordine_si_no === 'SI' || item.numero_ordine) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">Ordinato</span>;
    }
    if (item.autorizzazione) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">Autorizzato</span>;
    }
    if (item.data_richiesta) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">Richiesto</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">In Valutazione</span>;
  };

  // Get tipo modulo badge color
  const getTipoModuloBadge = (tipo: string) => {
    if (tipo === 'MOD.01') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">MOD.01</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-300">MOD.02</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestione Richieste di Acquisto
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Piano Acquisti Attrezzature Sanitarie - USL Toscana Nord Ovest
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totale Richieste</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">MOD.01 (TS)</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.mod01}</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">MOD.02 (ECT)</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.mod02}</p>
                </div>
                <Package className="w-8 h-8 text-indigo-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quantità Totale</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalQuantita}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unità Operative</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.uniqueUOs}</p>
                </div>
                <Building2 className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-2" />
                  Cerca
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="descrizione, richiedente..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tipo Modulo Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Tipo Modulo
                </label>
                <select
                  value={tipoModuloFilter}
                  onChange={(e) => setTipoModuloFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti</option>
                  <option value="MOD.01">MOD.01 (TS)</option>
                  <option value="MOD.02">MOD.02 (Ecografi)</option>
                </select>
              </div>

              {/* UO Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Unità Operativa
                </label>
                <select
                  value={uoFilter}
                  onChange={(e) => setUoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutte</option>
                  {uniqueUO.map(uo => (
                    <option key={uo} value={uo}>{uo}</option>
                  ))}
                </select>
              </div>

              {/* Motivo Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo Acquisizione
                </label>
                <select
                  value={motivoFilter}
                  onChange={(e) => setMotivoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti</option>
                  {uniqueMotivi.map(motivo => (
                    <option key={motivo} value={motivo}>{motivo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessuna richiesta trovata
            </h3>
            <p className="text-gray-600">
              Prova a modificare i filtri di ricerca
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Card Header - Always Visible */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === index ? null : index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTipoModuloBadge(item.tipo_modulo)}
                        {getStatusBadge(item)}
                        {item.quantita && item.quantita > 1 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                            Qtà: {item.quantita}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.descrizione || 'Descrizione non disponibile'}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {item.richiedente}
                        </div>
                        {item.unita_operativa && (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {item.unita_operativa}
                          </div>
                        )}
                        {item.reparto_presidio && (
                          <span className="text-gray-500">• {item.reparto_presidio}</span>
                        )}
                        {item.data_richiesta && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(item.data_richiesta).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      {item.costo_iva_esclusa && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Costo stimato</p>
                          <p className="text-lg font-bold text-blue-600">
                            {new Intl.NumberFormat('it-IT', {
                              style: 'currency',
                              currency: 'EUR',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(parseFloat(item.costo_iva_esclusa))}
                          </p>
                        </div>
                      )}
                      {expandedId === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === index && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          Informazioni Richiedente
                        </h4>

                        {item.telefono && (
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Telefono</p>
                              <p className="text-sm text-gray-900">{item.telefono}</p>
                            </div>
                          </div>
                        )}

                        {item.email && (
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="text-sm text-gray-900">{item.email}</p>
                            </div>
                          </div>
                        )}

                        {item.direttore && (
                          <div>
                            <p className="text-xs text-gray-500">Direttore</p>
                            <p className="text-sm text-gray-900">{item.direttore}</p>
                          </div>
                        )}

                        {item.caratteristiche_tecniche && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Caratteristiche Tecniche</p>
                            <p className="text-sm text-gray-900">{item.caratteristiche_tecniche}</p>
                          </div>
                        )}

                        {item.tipo_modulo === 'MOD.02' && item.tipologia_trasduttori && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Trasduttori</p>
                            <p className="text-sm text-gray-900">{item.tipologia_trasduttori}</p>
                          </div>
                        )}

                        {item.procedura_diagnosi && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Procedura/Diagnosi</p>
                            <p className="text-sm text-gray-900">{item.procedura_diagnosi}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                          Dettagli Acquisizione
                        </h4>

                        {item.motivo_acquisizione && (
                          <div>
                            <p className="text-xs text-gray-500">Motivo</p>
                            <p className="text-sm text-gray-900">{item.motivo_acquisizione}</p>
                          </div>
                        )}

                        {item.tipologia_acquisto && (
                          <div>
                            <p className="text-xs text-gray-500">Tipologia</p>
                            <p className="text-sm text-gray-900">{item.tipologia_acquisto}</p>
                          </div>
                        )}

                        {item.miglioramenti_attesi && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Miglioramenti Attesi</p>
                            <p className="text-sm text-gray-900">{item.miglioramenti_attesi}</p>
                          </div>
                        )}

                        {item.risorse_necessarie && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Risorse Necessarie</p>
                            <p className="text-sm text-gray-900">{item.risorse_necessarie}</p>
                          </div>
                        )}

                        {item.autorizzazione && (
                          <div>
                            <p className="text-xs text-gray-500">Autorizzazione</p>
                            <p className="text-sm text-gray-900">{item.autorizzazione}</p>
                          </div>
                        )}

                        {item.numero_ordine && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-700 font-medium">ORDINE EMESSO</p>
                            <p className="text-sm text-green-900">
                              {item.anno_ordine && `${item.anno_ordine} - `}
                              {item.numero_ordine}
                            </p>
                          </div>
                        )}

                        {item.note && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Note</p>
                            <p className="text-sm text-gray-900 italic">{item.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
