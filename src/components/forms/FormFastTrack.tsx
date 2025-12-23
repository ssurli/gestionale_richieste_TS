'use client';

import React, { useState } from 'react';
import { Zap, Building2, User, Mail, Phone, FileText, Package, Euro, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { CurrencyInput } from '@/components/CurrencyInput';

type FastTrackCategory =
  | 'sostituzione_1_1'
  | 'urgenza_workaround'
  | 'upgrade_obbligato'
  | 'sotto_soglia'
  | 'prove_visioni'
  | 'service_estar'
  | 'consumabili_estar';

interface FormData {
  // Categoria Fast Track
  categoria: FastTrackCategory | '';

  // Richiedente
  richiedente: string;
  telefono: string;
  email: string;
  unitaOperativa: string;
  repartoPresidio: string;

  // Descrizione richiesta
  descrizione: string;
  motivazione: string;

  // Dati attrezzatura
  marca: string;
  modello: string;

  // Per sostituzioni: vecchia attrezzatura
  numeroInventarioVecchio: string;

  // Riferimenti ESTAR
  numeroConvenzioneESTAR: string;
  numeroDetESTAR: string;
  fornitoreAggiudicato: string;

  // Dati economici
  costoStimato: string;

  // Urgenza e workaround
  impatto: string;
  workaroundDisponibile: string;

  // Note
  note: string;
}

export function FormFastTrack() {
  const [formData, setFormData] = useState<FormData>({
    categoria: '',
    richiedente: '',
    telefono: '',
    email: '',
    unitaOperativa: '',
    repartoPresidio: '',
    descrizione: '',
    motivazione: '',
    marca: '',
    modello: '',
    numeroInventarioVecchio: '',
    numeroConvenzioneESTAR: '',
    numeroDetESTAR: '',
    fornitoreAggiudicato: '',
    costoStimato: '',
    impatto: '',
    workaroundDisponibile: '',
    note: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Fast Track Form submitted:', formData);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      // Reset form
      setFormData({
        categoria: '',
        richiedente: '',
        telefono: '',
        email: '',
        unitaOperativa: '',
        repartoPresidio: '',
        descrizione: '',
        motivazione: '',
        marca: '',
        modello: '',
        numeroInventarioVecchio: '',
        numeroConvenzioneESTAR: '',
        numeroDetESTAR: '',
        fornitoreAggiudicato: '',
        costoStimato: '',
        impatto: '',
        workaroundDisponibile: '',
        note: ''
      });
    }, 3000);
  };

  const categories = [
    { value: 'sostituzione_1_1', label: 'A - Sostituzione 1:1 fuori uso (già aggiudicata)' },
    { value: 'urgenza_workaround', label: 'B - Urgenza operativa (con workaround temporaneo)' },
    { value: 'upgrade_obbligato', label: 'C - Upgrade obbligato (fine supporto fornitore)' },
    { value: 'sotto_soglia', label: 'D - Sotto soglia €15.000 (già aggiudicata)' },
    { value: 'prove_visioni', label: 'E - Prove/visioni (tecnologia in gara ESTAR)' },
    { value: 'service_estar', label: 'F - Service già aggiudicato ESTAR' },
    { value: 'consumabili_estar', label: 'G - Consumabili ESTAR (incremento volumi)' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-t-lg shadow-lg px-6 py-6">
          <div className="flex items-center gap-3 text-white">
            <Zap className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">FAST TRACK - Track 2</h1>
              <p className="text-orange-100 text-sm mt-1">
                Modulo richiesta urgente semplificata (5-7 giorni lavorativi)
              </p>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-900">
              <p className="font-semibold mb-1">Requisiti Fast Track:</p>
              <ul className="list-disc list-inside space-y-1 text-orange-800">
                <li>Tecnologia già aggiudicata ESTAR o sotto soglia €15.000</li>
                <li>Sostituzioni 1:1 o urgenze con workaround temporaneo disponibile</li>
                <li>Tempo massimo di gestione: 5-7 giorni lavorativi</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-lg p-6 space-y-6">
          {/* Categoria Fast Track */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Categoria Richiesta Fast Track
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona categoria applicabile <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as FastTrackCategory })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">-- Seleziona categoria --</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dati Richiedente */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              Dati Richiedente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome e Cognome <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.richiedente}
                  onChange={(e) => setFormData({ ...formData, richiedente: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: Mario Rossi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefono <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: 0586223054"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: mario.rossi@uslnordovest.toscana.it"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unità Operativa <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.unitaOperativa}
                  onChange={(e) => setFormData({ ...formData, unitaOperativa: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: Cardiologia"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reparto/Presidio <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.repartoPresidio}
                  onChange={(e) => setFormData({ ...formData, repartoPresidio: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: Ospedale di Livorno"
                />
              </div>
            </div>
          </div>

          {/* Descrizione Attrezzatura */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              Descrizione Attrezzatura
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.descrizione}
                  onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: ECG carrellato 12 derivazioni"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    placeholder="es: GE Healthcare"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modello
                  </label>
                  <input
                    type="text"
                    value={formData.modello}
                    onChange={(e) => setFormData({ ...formData, modello: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    placeholder="es: MAC 2000"
                  />
                </div>
              </div>

              {(formData.categoria === 'sostituzione_1_1') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numero Inventario Vecchia Attrezzatura
                  </label>
                  <input
                    type="text"
                    value={formData.numeroInventarioVecchio}
                    onChange={(e) => setFormData({ ...formData, numeroInventarioVecchio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    placeholder="es: INV-2015-00123"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Riferimenti ESTAR */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              Riferimenti ESTAR/Convenzione
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero Convenzione ESTAR
                </label>
                <input
                  type="text"
                  value={formData.numeroConvenzioneESTAR}
                  onChange={(e) => setFormData({ ...formData, numeroConvenzioneESTAR: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: 00001669"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numero Determinazione ESTAR
                </label>
                <input
                  type="text"
                  value={formData.numeroDetESTAR}
                  onChange={(e) => setFormData({ ...formData, numeroDetESTAR: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: Det. 1446/2024"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fornitore Aggiudicato
                </label>
                <input
                  type="text"
                  value={formData.fornitoreAggiudicato}
                  onChange={(e) => setFormData({ ...formData, fornitoreAggiudicato: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: Ditta ABC Medical S.r.l."
                />
              </div>
            </div>
          </div>

          {/* Motivazione e Impatto */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Motivazione e Impatto Operativo
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivazione della richiesta <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.motivazione}
                  onChange={(e) => setFormData({ ...formData, motivazione: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: ECG attuale fuori uso per guasto irreparabile. Necessaria sostituzione immediata per continuità assistenziale."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impatto su attività/pazienti <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.impatto}
                  onChange={(e) => setFormData({ ...formData, impatto: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                  placeholder="es: Riduzione capacità diagnostica del 50%, pazienti dirottati su altro presidio"
                />
              </div>
              {formData.categoria === 'urgenza_workaround' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workaround temporaneo disponibile
                  </label>
                  <textarea
                    value={formData.workaroundDisponibile}
                    onChange={(e) => setFormData({ ...formData, workaroundDisponibile: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                    placeholder="es: Utilizzo ECG portatile di backup con prestazioni ridotte"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Dati Economici */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5 text-orange-600" />
              Dati Economici
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Stimato (IVA esclusa) <span className="text-red-600">*</span>
              </label>
              <CurrencyInput
                value={formData.costoStimato}
                onChange={(value) => setFormData({ ...formData, costoStimato: value })}
                placeholder="es: 12.500,00"
                required
              />
              {formData.categoria === 'sotto_soglia' && (
                <p className="mt-2 text-sm text-orange-700">
                  ⚠️ Verificare che il costo sia inferiore a €15.000 per rimanere in Fast Track
                </p>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Note Aggiuntive
            </h2>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
              placeholder="Eventuali note o informazioni aggiuntive..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="text-red-600">*</span> Campi obbligatori
            </p>
            <button
              type="submit"
              disabled={submitted}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                submitted
                  ? 'bg-green-600 text-white'
                  : 'bg-orange-600 text-white hover:bg-orange-700'
              }`}
            >
              {submitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Richiesta Inviata!
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Invia Richiesta Fast Track
                </>
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              Dopo l'invio, la richiesta sarà presa in carico dal <strong>Coordinatore CommAz</strong> per
              pre-screening entro 3 giorni lavorativi. Tempo massimo di gestione: <strong>5-7 giorni lavorativi</strong>.
            </p>
          </div>
        </form>

        {submitted && (
          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Richiesta Fast Track inviata con successo!</p>
                <p className="mt-1">
                  Riceverai conferma di presa in carico entro 1 giorno lavorativo.
                  Tempo previsto di gestione: 5-7 giorni lavorativi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
