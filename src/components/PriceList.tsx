'use client';

import { useState, useMemo } from 'react';
import { Search, FileText, Calendar, Building2, TrendingUp, AlertCircle, Filter } from 'lucide-react';

export interface PriceListItem {
  'Stato': string;
  'Integrativo': string;
  'Titolo Ordinativo': string;
  'Registro di Sistema': string;
  'Numero Convenzione completa': string;
  'Data Decorrenza Ordinativo': string;
  'Data Scadenza Ordinativo': string | null;
  'Convenzione completa': string;
  'Totale Ordinativo': string;
  'Ente': string;
}

interface PriceListProps {
  data: PriceListItem[];
}

export function PriceList({ data }: PriceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date');

  // Extract unique statuses
  const statuses = useMemo(() => {
    const uniqueStatuses = new Set(data.map(item => item.Stato));
    return Array.from(uniqueStatuses).sort();
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item['Convenzione completa'].toLowerCase().includes(searchLower) ||
        item['Titolo Ordinativo'].toLowerCase().includes(searchLower) ||
        item['Registro di Sistema'].toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'all' || item.Stato === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const dateA = new Date(a['Data Decorrenza Ordinativo']);
        const dateB = new Date(b['Data Decorrenza Ordinativo']);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      });
    } else {
      filtered.sort((a, b) => {
        const priceA = parseItalianPrice(a['Totale Ordinativo']);
        const priceB = parseItalianPrice(b['Totale Ordinativo']);
        return priceB - priceA; // Highest first
      });
    }

    return filtered;
  }, [data, searchTerm, statusFilter, sortBy]);

  // Extract equipment category from convention name
  const getEquipmentCategory = (convention: string): string => {
    // Extract main equipment type (before " - " or " Det.")
    const match = convention.match(/^([^-]+?)(?:\s+-\s+|\s+Det\.)/);
    if (match) {
      return match[1].trim();
    }
    return convention.split(' ').slice(0, 3).join(' ');
  };

  // Extract supplier from convention name
  const getSupplier = (convention: string): string | null => {
    const patterns = [
      /Ditta\s+([^-\d]+)/i,
      /DITTA\s+([A-Z\s]+)/,
    ];

    for (const pattern of patterns) {
      const match = convention.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  };

  // Parse Italian price format to number
  const parseItalianPrice = (price: string): number => {
    let cleaned = price.replace(/\s/g, ''); // Remove spaces

    // Italian format detection:
    // - Has comma: remove all dots (thousands), replace comma with dot
    // - Multiple dots without comma: Italian thousands separator
    // - Single dot: could be US format OR Italian with no decimals - keep as is
    if (cleaned.includes(',')) {
      // Definitely Italian: 1.234,56 or 1234,56
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else if ((cleaned.match(/\./g) || []).length > 1) {
      // Multiple dots without comma: 46.675.59 is Italian format 46.675,59
      // Last dot should be comma, others are thousands
      const lastDotIndex = cleaned.lastIndexOf('.');
      cleaned = cleaned.substring(0, lastDotIndex).replace(/\./g, '') + '.' + cleaned.substring(lastDotIndex + 1);
    }

    return parseFloat(cleaned) || 0;
  };

  // Format price
  const formatPrice = (price: string): string => {
    const numPrice = parseItalianPrice(price);

    if (isNaN(numPrice)) return '€ 0,00';

    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Accettato':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Inviato':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'In Approvazione Gestore':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredData.reduce((sum, item) => {
      return sum + parseItalianPrice(item['Totale Ordinativo']);
    }, 0);

    const avgPrice = filteredData.length > 0 ? total / filteredData.length : 0;

    const accepted = filteredData.filter(item => item.Stato === 'Accettato').length;

    return {
      total: formatPrice(total.toString()),
      average: formatPrice(avgPrice.toString()),
      count: filteredData.length,
      acceptedPercentage: filteredData.length > 0 ? ((accepted / filteredData.length) * 100).toFixed(1) : '0',
    };
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Listino Prezzi e Storico Acquisti
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Riferimento ordinativi recenti - ASL Toscana Nord Ovest
              </p>
            </div>
          </div>

          {/* Warning Alert */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800">
                  Nota Importante
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  I prezzi indicati sono <strong>totali di ordinativi</strong> che possono contenere più prodotti,
                  accessori e servizi. <strong>Non sono prezzi unitari</strong>. Utilizzare come riferimento
                  orientativo per convenzioni attive e fornitori.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ordinativi Trovati</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valore Totale</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valore Medio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">% Accettati</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.acceptedPercentage}%</p>
                </div>
                <Building2 className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-2" />
                  Cerca Attrezzatura
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="es. ecografo, letto, monitor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Filtra per Stato
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti gli stati</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordina per
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'price')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Data (più recenti)</option>
                  <option value="price">Prezzo (più alti)</option>
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
              Nessun ordinativo trovato
            </h3>
            <p className="text-gray-600">
              Prova a modificare i filtri di ricerca
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((item, index) => {
              const category = getEquipmentCategory(item['Convenzione completa']);
              const supplier = getSupplier(item['Convenzione completa']);

              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {category}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {item['Convenzione completa']}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.Stato)}`}>
                            {item.Stato}
                          </span>
                          {supplier && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300">
                              <Building2 className="w-3 h-3 mr-1" />
                              {supplier}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500 mb-1">Totale Ordinativo</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(item['Totale Ordinativo'])}
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Registro Sistema</p>
                        <p className="text-sm font-medium text-gray-900">{item['Registro di Sistema']}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Numero Convenzione</p>
                        <p className="text-sm font-medium text-gray-900">{item['Numero Convenzione completa']}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Data Decorrenza</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(item['Data Decorrenza Ordinativo']).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>

                    {item['Data Scadenza Ordinativo'] && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Scadenza convenzione: {new Date(item['Data Scadenza Ordinativo']).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Come utilizzare questo listino
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Riferimento prezzi:</strong> I totali mostrati includono IVA, accessori, training, service - NON sono prezzi unitari</li>
            <li>• <strong>Convenzioni attive:</strong> Verifica se esiste già una convenzione attiva per l'attrezzatura che cerchi</li>
            <li>• <strong>Fornitori:</strong> Identifica i fornitori già utilizzati dall'azienda per quella categoria</li>
            <li>• <strong>Tempistiche:</strong> Controlla le date di scadenza delle convenzioni ancora valide</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
