'use client';

import React, { useState } from 'react';
import { CheckCircle, Building2, User, Mail, Phone, FileText, Package, Euro, Gift, AlertTriangle, TrendingUp } from 'lucide-react';
import { CurrencyInput } from '@/components/CurrencyInput';

type SemplificataCategory = 'donazione' | 'ampliamento' | 'upgrade';

interface FormData {
  // Categoria Semplificata
  categoria: SemplificataCategory | '';

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
  quantita: string;

  // Per donazioni
  donatore: string;
  donatoreIndirizzo: string;
  valoreDonazione: string;
  materialiDedicati: 'si' | 'no' | '';
  tecnologiaConosciuta: 'si' | 'no' | '';

  // Per ampliamenti
  numeroAttrezzatureAttuali: string;
  incrementoPrestazioni: string;
  giustificazioneAmpliamento: string;

  // Per upgrade
  tipoUpgrade: string;
  attrezzaturaInteressata: string;

  // Dati economici
  costoStimato: string;
  fonteFi nanziamento: string;

  // Impatto organizzativo
  impattoOrganizzativo: string;
  formazioneNecessaria: 'si' | 'no' | '';
  adeguamentiStrutturali: 'si' | 'no' | '';

  // Note
  note: string;
}

export function FormSemplificato() {
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
    quantita: '1',
    donatore: '',
    donatoreIndirizzo: '',
    valoreDonazione: '',
    materialiDedicati: '',
    tecnologiaConosciuta: '',
    numeroAttrezzatureAttuali: '',
    incrementoPrestazioni: '',
    giustificazioneAmpliamento: '',
    tipoUpgrade: '',
    attrezzaturaInteressata: '',
    costoStimato: '',
    fonteFiPrevisto: '',
    impattoOrganizzativo: '',
    formazioneNecessaria: '',
    adeguamentiStrutturali: '',
    note: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateDonazione = (): string[] => {
    const errors: string[] = [];

    if (formData.categoria === 'donazione') {
      const valore = parseFloat(formData.valoreDonazione.replace(/\./g, '').replace(',', '.'));

      if (valore >= 50000) {
        errors.push('⚠️ Donazioni ≥€50.000 richiedono Track 4 - HTA Completo');
      }

      if (formData.materialiDedicati === 'si') {
        errors.push('⚠️ Donazioni con materiali dedicati violano DGR 306/2024 e richiedono Track 4');
      }

      if (formData.tecnologiaConosciuta === 'no') {
        errors.push('⚠️ Tecnologie mai utilizzate richiedono Track 4 - HTA Completo');
      }

      if (!formData.donatore) {
        errors.push('❌ Specificare il donatore (DGR 306/2024 richiede trasparenza)');
      }
    }

    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateDonazione();
    setValidationErrors(errors);

    if (errors.some(e => e.startsWith('❌'))) {
      return; // Blocca invio se ci sono errori critici
    }

    console.log('Form Semplificato submitted:', formData);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setValidationErrors([]);
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
        quantita: '1',
        donatore: '',
        donatoreIndirizzo: '',
        valoreDonazione: '',
        materialiDedicati: '',
        tecnologiaConosciuta: '',
        numeroAttrezzatureAttuali: '',
        incrementoPrestazioni: '',
        giustificazioneAmpliamento: '',
        tipoUpgrade: '',
        attrezzaturaInteressata: '',
        costoStimato: '',
        fonteFinanziamento: '',
        impattoOrganizzativo: '',
        formazioneNecessaria: '',
        adeguamentiStrutturali: '',
        note: ''
      });
    }, 3000);
  };

  const categories = [
    { value: 'donazione', label: 'A - Donazione (<€50.000, no materiali dedicati)' },
    { value: 'ampliamento', label: 'B - Ampliamento dotazione tecnologica esistente' },
    { value: 'upgrade', label: 'C - Upgrade funzionali programmabili' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-t-lg shadow-lg px-6 py-6">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">PROCEDURA SEMPLIFICATA - Track 3</h1>
              <p className="text-yellow-100 text-sm mt-1">
                Modulo richiesta semplificata (15-20 giorni lavorativi)
              </p>
            </div>
          </div>
        </div>

        {/* Info Alert */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-900">
              <p className="font-semibold mb-1">Requisiti Procedura Semplificata:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                <li><strong>Donazioni:</strong> valore &lt;€50.000, NO materiali dedicati (DGR 306/2024)</li>
                <li><strong>Ampliamenti:</strong> aumento dotazione tecnologica già in uso</li>
                <li><strong>Upgrade:</strong> aggiornamenti funzionali programmabili</li>
                <li>Tempo massimo di gestione: 15-20 giorni lavorativi</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            validationErrors.some(e => e.startsWith('❌'))
              ? 'bg-red-50 border-red-500'
              : 'bg-orange-50 border-orange-500'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                validationErrors.some(e => e.startsWith('❌')) ? 'text-red-600' : 'text-orange-600'
              }`} />
              <div className="text-sm">
                <p className="font-semibold mb-2">Attenzione:</p>
                <ul className="space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className={
                      error.startsWith('❌') ? 'text-red-900' : 'text-orange-900'
                    }>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-b-lg shadow-lg p-6 space-y-6">
          {/* Categoria */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-600" />
              Categoria Richiesta
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleziona categoria <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as SemplificataCategory })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
              <User className="w-5 h-5 text-yellow-600" />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Descrizione Attrezzatura */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-600" />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantità <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantita}
                    onChange={(e) => setFormData({ ...formData, quantita: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sezione Specifica per Donazioni */}
          {formData.categoria === 'donazione' && (
            <div className="border-b border-gray-200 pb-6 bg-blue-50 -mx-6 px-6 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-600" />
                Dati Donazione (DGR 306/2024)
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Donatore <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.donatore}
                      onChange={(e) => setFormData({ ...formData, donatore: e.target.value })}
                      required={formData.categoria === 'donazione'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                      placeholder="Nome completo donatore/associazione"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valore Donazione (€) <span className="text-red-600">*</span>
                    </label>
                    <CurrencyInput
                      value={formData.valoreDonazione}
                      onChange={(value) => {
                        setFormData({ ...formData, valoreDonazione: value });
                        setTimeout(() => setValidationErrors(validateDonazione()), 100);
                      }}
                      placeholder="es: 35.000,00"
                      required={formData.categoria === 'donazione'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Indirizzo completo donatore
                  </label>
                  <input
                    type="text"
                    value={formData.donatoreIndirizzo}
                    onChange={(e) => setFormData({ ...formData, donatoreIndirizzo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      La tecnologia è già conosciuta/in uso? <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.tecnologiaConosciuta}
                      onChange={(e) => {
                        setFormData({ ...formData, tecnologiaConosciuta: e.target.value as 'si' | 'no' });
                        setTimeout(() => setValidationErrors(validateDonazione()), 100);
                      }}
                      required={formData.categoria === 'donazione'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">-- Seleziona --</option>
                      <option value="si">Sì (già in uso in azienda)</option>
                      <option value="no">No (nuova tecnologia)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materiali d'uso dedicati? <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.materialiDedicati}
                      onChange={(e) => {
                        setFormData({ ...formData, materialiDedicati: e.target.value as 'si' | 'no' });
                        setTimeout(() => setValidationErrors(validateDonazione()), 100);
                      }}
                      required={formData.categoria === 'donazione'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="">-- Seleziona --</option>
                      <option value="no">No (DGR 306/2024 compliant)</option>
                      <option value="si">Sì (richiede Track 4)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sezione Specifica per Ampliamenti */}
          {formData.categoria === 'ampliamento' && (
            <div className="border-b border-gray-200 pb-6 bg-green-50 -mx-6 px-6 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Dati Ampliamento Dotazione
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numero attrezzature attuali <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.numeroAttrezzatureAttuali}
                      onChange={(e) => setFormData({ ...formData, numeroAttrezzatureAttuali: e.target.value })}
                      required={formData.categoria === 'ampliamento'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                      placeholder="es: 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incremento prestazioni previsto
                    </label>
                    <input
                      type="text"
                      value={formData.incrementoPrestazioni}
                      onChange={(e) => setFormData({ ...formData, incrementoPrestazioni: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                      placeholder="es: +30% prestazioni/anno"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giustificazione ampliamento <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    value={formData.giustificazioneAmpliamento}
                    onChange={(e) => setFormData({ ...formData, giustificazioneAmpliamento: e.target.value })}
                    required={formData.categoria === 'ampliamento'}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                    placeholder="es: Aumento liste d'attesa del 40%, necessità di ridurre tempi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sezione Specifica per Upgrade */}
          {formData.categoria === 'upgrade' && (
            <div className="border-b border-gray-200 pb-6 bg-purple-50 -mx-6 px-6 py-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Dati Upgrade Funzionale
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo di upgrade <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.tipoUpgrade}
                    onChange={(e) => setFormData({ ...formData, tipoUpgrade: e.target.value })}
                    required={formData.categoria === 'upgrade'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">-- Seleziona tipo --</option>
                    <option value="software">Upgrade software</option>
                    <option value="hardware">Upgrade hardware</option>
                    <option value="entrambi">Upgrade software + hardware</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attrezzatura interessata <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.attrezzaturaInteressata}
                    onChange={(e) => setFormData({ ...formData, attrezzaturaInteressata: e.target.value })}
                    required={formData.categoria === 'upgrade'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                    placeholder="es: TAC Siemens modello XYZ, n. inventario ABC-123"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Motivazione */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Motivazione
            </h2>
            <textarea
              value={formData.motivazione}
              onChange={(e) => setFormData({ ...formData, motivazione: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
              placeholder="Descrivere in dettaglio le ragioni della richiesta..."
            />
          </div>

          {/* Dati Economici */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Euro className="w-5 h-5 text-yellow-600" />
              Dati Economici
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Stimato (IVA esclusa) <span className="text-red-600">*</span>
                </label>
                <CurrencyInput
                  value={formData.costoStimato}
                  onChange={(value) => setFormData({ ...formData, costoStimato: value })}
                  placeholder="es: 35.000,00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonte di finanziamento
                </label>
                <input
                  type="text"
                  value={formData.fonteFinanziamento}
                  onChange={(e) => setFormData({ ...formData, fonteFinanziamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  placeholder="es: Budget corrente UO, Fondi regionali, Donazione"
                />
              </div>
            </div>
          </div>

          {/* Impatto Organizzativo */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Impatto Organizzativo
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione impatto organizzativo
                </label>
                <textarea
                  value={formData.impattoOrganizzativo}
                  onChange={(e) => setFormData({ ...formData, impattoOrganizzativo: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  placeholder="es: Nessun impatto significativo, utilizzo immediato"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formazione necessaria?
                  </label>
                  <select
                    value={formData.formazioneNecessaria}
                    onChange={(e) => setFormData({ ...formData, formazioneNecessaria: e.target.value as 'si' | 'no' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">-- Seleziona --</option>
                    <option value="no">No</option>
                    <option value="si">Sì (specificare nelle note)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adeguamenti strutturali necessari?
                  </label>
                  <select
                    value={formData.adeguamentiStrutturali}
                    onChange={(e) => setFormData({ ...formData, adeguamentiStrutturali: e.target.value as 'si' | 'no' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">-- Seleziona --</option>
                    <option value="no">No</option>
                    <option value="si">Sì (specificare nelle note)</option>
                  </select>
                </div>
              </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
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
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              {submitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Richiesta Inviata!
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Invia Richiesta Semplificata
                </>
              )}
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              Dopo l'invio, la richiesta sarà valutata da <strong>Coordinatore CommAz</strong> e
              <strong> CommAz ristretta</strong>. Tempo massimo di gestione: <strong>15-20 giorni lavorativi</strong>.
            </p>
          </div>
        </form>

        {submitted && (
          <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-900">
                <p className="font-semibold">Richiesta Procedura Semplificata inviata con successo!</p>
                <p className="mt-1">
                  Riceverai conferma di presa in carico entro 2 giorni lavorativi.
                  Tempo previsto di gestione: 15-20 giorni lavorativi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
