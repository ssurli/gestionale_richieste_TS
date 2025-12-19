'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Tag, AlertCircle } from 'lucide-react';

export interface CatalogoEstarItem {
  categoria: string;
  codice: string;
  descrizione: string;
  costo_unitario: number;
  iva_percentuale: number;
  applicabile_a: string;
}

interface PriceSuggestionProps {
  catalogo: CatalogoEstarItem[];
  searchText: string;
  onSelectPrice?: (price: number, item: CatalogoEstarItem) => void;
  className?: string;
}

export function PriceSuggestion({ catalogo, searchText, onSelectPrice, className = '' }: PriceSuggestionProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Find matching catalog items
  const suggestions = useMemo(() => {
    if (!searchText || searchText.length < 3) return [];

    const searchLower = searchText.toLowerCase();

    return catalogo
      .filter(item => {
        return (
          item.descrizione.toLowerCase().includes(searchLower) ||
          item.codice.toLowerCase().includes(searchLower) ||
          item.categoria.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, 5); // Max 5 suggestions
  }, [catalogo, searchText]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0);
  }, [suggestions]);

  if (suggestions.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const calculatePriceWithIVA = (price: number, iva: number) => {
    return price + (price * iva / 100);
  };

  return (
    <div className={`mt-2 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900">
              Prezzi di Riferimento - Catalogo ESTAR
            </h4>
            <p className="text-xs text-blue-700 mt-1">
              Trovati {suggestions.length} prodotti simili nel catalogo. Clicca per utilizzare il prezzo.
            </p>
          </div>
        </div>

        <div className="space-y-2 mt-3">
          {suggestions.map((item, index) => {
            const priceWithIVA = calculatePriceWithIVA(item.costo_unitario, item.iva_percentuale);

            return (
              <div
                key={index}
                className="bg-white rounded-md p-3 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => {
                  if (onSelectPrice) {
                    onSelectPrice(item.costo_unitario, item);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {item.codice}
                      </span>
                      <span className="text-xs text-gray-500">{item.categoria}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{item.descrizione}</p>
                    {item.applicabile_a && (
                      <p className="text-xs text-gray-500 mt-1">
                        Applicabile a: {item.applicabile_a}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-4">
                    <div className="text-xs text-gray-500">IVA esclusa</div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatPrice(item.costo_unitario)}
                    </div>
                    {item.iva_percentuale > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        IVA {item.iva_percentuale}%: {formatPrice(priceWithIVA)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Nota:</strong> I prezzi sono orientativi e provengono dal Catalogo ESTAR.
              Potrebbero variare in base al fornitore e alla configurazione richiesta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for displaying selected catalog item info
interface SelectedCatalogItemProps {
  item: CatalogoEstarItem | null;
  onClear?: () => void;
}

export function SelectedCatalogItem({ item, onClear }: SelectedCatalogItemProps) {
  if (!item) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <Tag className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-green-900">
              Prezzo da Catalogo ESTAR
            </h4>
            <p className="text-sm text-green-800 mt-1">
              {item.codice} - {item.descrizione}
            </p>
            <p className="text-xs text-green-700 mt-1">
              Prezzo: {formatPrice(item.costo_unitario)} (IVA {item.iva_percentuale}%)
            </p>
          </div>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-xs text-green-700 hover:text-green-900 underline"
          >
            Rimuovi
          </button>
        )}
      </div>
    </div>
  );
}
