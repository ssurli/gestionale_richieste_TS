'use client';

import React, { useState } from 'react';
import {
  TechnologyRequest,
  AcquisitionType,
  EquipmentType,
  TrackType,
  ServiceContract,
  Consumables,
  Donation,
  BudgetCoverage
} from '@/types';
import { eseguiTriage, TriageResult } from '@/lib/triage';
import {
  validaDGR306_2024,
  validaServiceContract,
  validaConsumabili,
  validaBudget,
  validaCoerenzaRichiesta
} from '@/lib/validations';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function RequestForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<TechnologyRequest>>({});
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Esegui triage
    const triage = eseguiTriage(formData);
    setTriageResult(triage);

    // Valida
    const errors: string[] = [];
    const warnings: string[] = [];

    if (formData.budget) {
      const budgetValidation = validaBudget(formData.budget);
      errors.push(...budgetValidation.errors);
      warnings.push(...budgetValidation.warnings);
    }

    if (formData.isDonazione && formData.donazione) {
      const dgrValidation = validaDGR306_2024(formData.donazione);
      errors.push(...dgrValidation.errors);
      warnings.push(...dgrValidation.warnings);
    }

    if (formData.richiedeService && formData.service) {
      const serviceValidation = validaServiceContract(formData.service);
      errors.push(...serviceValidation.errors);
      warnings.push(...serviceValidation.warnings);
    }

    if (formData.richiedeConsumabili && formData.consumabili) {
      const consumabiliValidation = validaConsumabili(formData.consumabili);
      errors.push(...consumabiliValidation.errors);
      warnings.push(...consumabiliValidation.warnings);
    }

    const coerenzaValidation = validaCoerenzaRichiesta({
      isDonazione: formData.isDonazione || false,
      donazione: formData.donazione,
      richiedeService: formData.richiedeService || false,
      service: formData.service,
      richiedeConsumabili: formData.richiedeConsumabili || false,
      consumabili: formData.consumabili,
      budget: formData.budget!
    });

    errors.push(...coerenzaValidation.errors);
    warnings.push(...coerenzaValidation.warnings);

    setValidationErrors(errors);
    setValidationWarnings(warnings);

    if (errors.length > 0) {
      return;
    }

    // Procedi con salvataggio
    console.log('Richiesta validata:', formData);
    console.log('Track assegnato:', triage.trackAssegnato);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6">
          Nuova Richiesta Tecnologia Sanitaria
        </h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {s < 5 && (
                  <div
                    className={`w-16 h-1 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span>Dati Base</span>
            <span>Apparecchiatura</span>
            <span>Budget</span>
            <span>Service/Cons.</span>
            <span>Revisione</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Dati Base */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Informazioni Base</h2>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Unità Operativa *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.unitaOperativa || ''}
                  onChange={e =>
                    setFormData({ ...formData, unitaOperativa: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Dipartimento *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.dipartimento || ''}
                  onChange={e =>
                    setFormData({ ...formData, dipartimento: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo Acquisto *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.tipoAcquisto || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      tipoAcquisto: e.target.value as AcquisitionType
                    })
                  }
                >
                  <option value="">Seleziona...</option>
                  <option value={AcquisitionType.PROGRAMMATO}>Programmato</option>
                  <option value={AcquisitionType.NON_PROGRAMMATO}>
                    Non Programmato
                  </option>
                  <option value={AcquisitionType.SOSTITUZIONE}>Sostituzione</option>
                  <option value={AcquisitionType.DONAZIONE}>Donazione</option>
                  <option value={AcquisitionType.COMODATO}>Comodato</option>
                  <option value={AcquisitionType.NOLEGGIO}>Noleggio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo Apparecchiatura *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.tipoApparecchiatura || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      tipoApparecchiatura: e.target.value as EquipmentType
                    })
                  }
                >
                  <option value="">Seleziona...</option>
                  <option value={EquipmentType.GENERALE}>Generale</option>
                  <option value={EquipmentType.ECOGRAFO}>Ecografo</option>
                  <option value={EquipmentType.DIAGNOSTICA}>Diagnostica</option>
                  <option value={EquipmentType.LABORATORIO}>Laboratorio</option>
                  <option value={EquipmentType.TERAPIA}>Terapia</option>
                  <option value={EquipmentType.RIABILITAZIONE}>
                    Riabilitazione
                  </option>
                  <option value={EquipmentType.ALTRO}>Altro</option>
                </select>
              </div>

              {formData.tipoAcquisto === AcquisitionType.SOSTITUZIONE && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Dettagli Sostituzione</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">
                        Apparecchiatura Sostituita
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded"
                        value={formData.apparecchiaturaSOStituita || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            apparecchiaturaSOStituita: e.target.value
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        Motivo Sostituzione
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded"
                        value={formData.motivoSostituzione || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            motivoSostituzione: e.target.value as any
                          })
                        }
                      >
                        <option value="">Seleziona...</option>
                        <option value="NON_RIPARABILE">Non Riparabile</option>
                        <option value="OBSOLETO">Obsoleto</option>
                        <option value="UPGRADE_OBBLIGATO">
                          Upgrade Obbligato
                        </option>
                        <option value="ALTRO">Altro</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {formData.tipoAcquisto === AcquisitionType.DONAZIONE && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>VINCOLO DGR 306/2024:</strong> Vietate donazioni con
                      materiale d&apos;uso dedicato
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDonazione"
                      checked={formData.isDonazione || false}
                      onChange={e =>
                        setFormData({ ...formData, isDonazione: e.target.checked })
                      }
                    />
                    <label htmlFor="isDonazione" className="text-sm">
                      Confermo che è una donazione
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Apparecchiatura */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                Dettagli Apparecchiatura
              </h2>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Apparecchiatura *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.nomeApparecchiatura || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      nomeApparecchiatura: e.target.value
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrizione Dettagliata *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.descrizioneDettagliata || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      descrizioneDettagliata: e.target.value
                    })
                  }
                  placeholder="Descrivi l'apparecchiatura richiesta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Caratteristiche Tecniche *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.caratteristicheTecniche || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      caratteristicheTecniche: e.target.value
                    })
                  }
                  placeholder="Specifiche tecniche richieste..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Motivazione Richiesta *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.motivazioneRichiesta || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      motivazioneRichiesta: e.target.value
                    })
                  }
                  placeholder="Motivazione clinica/organizzativa della richiesta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Impatto Assistenziale *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.impattoAssistenziale || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      impattoAssistenziale: e.target.value
                    })
                  }
                  placeholder="Impatto sul servizio e sui pazienti..."
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.richiedeAdeguamentiStrutturali || false}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        richiedeAdeguamentiStrutturali: e.target.checked
                      })
                    }
                  />
                  <span className="text-sm">
                    Richiede adeguamenti strutturali/impiantistici
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50"
              >
                Indietro
              </button>
            )}
            {step < 5 && (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Avanti
              </button>
            )}
            {step === 5 && (
              <button
                type="submit"
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Invia Richiesta
              </button>
            )}
          </div>
        </form>

        {/* Validation Results */}
        {validationErrors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">
                  Errori Validazione
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Avvisi</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                  {validationWarnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Triage Result */}
        {triageResult && validationErrors.length === 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">
                  Track Assegnato
                </h3>
                <p className="text-sm text-green-700">
                  <strong>Track:</strong> {triageResult.trackAssegnato}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Motivazione:</strong> {triageResult.motivazione}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
