'use client';

import React, { useState } from 'react';
import { FileText, Printer, Save } from 'lucide-react';

/**
 * MOD.01_TS - MODULO RICHIESTA ATTREZZATURE SANITARIE
 * (ad esclusione delle apparecchiature ecografiche)
 *
 * Form fedele al modulo PDF originale
 */

interface FormData01 {
  // 1. RICHIEDENTE E COLLOCAZIONE AZIENDALE
  richiedente: string;
  telefono: string;
  email: string;
  repartoDestinatario: string;
  presidioUtilizzo: string;

  // 2. TECNOLOGIA RICHIESTA
  descrizione: string;
  quantita: string;
  caratteristicheTecniche: string;
  proceduraDiagnosi: string;
  prestazioniAnnue: string;
  comeVienesvoltaAttualmente: string;

  // 3. MOTIVO ACQUISIZIONE
  motivoAcquisizione: 'incremento' | 'sostituzione' | 'aggiornamento' | '';
  codFuoriUso: string;
  tecnologieStessaTipologia: 'si' | 'no' | '';
  specificareTecnologie: string;
  miglioramentiAttesi: string;

  // 4. NECESSITA' ACCESSORIE
  risorseNecessarie: string;

  // 5. ASPETTI CONTRATTUALI E DI FINANZIAMENTO
  tipoContratto: 'acquisto' | 'leasing' | 'service' | 'noleggio' | '';
  costoAcquisto: string;
  durataLeasing: string;
  durataService: string;
  durataNoleggio: string;
  costoNoleggioServiceLeasing: string;
  costoConsumabili: string;
  progettoFinalizzato: 'si' | 'no' | '';
  codProgetto: string;

  // 6. NOTE
  note: string;

  // FIRME
  dataRichiedente: string;
  dataDirettoreUO: string;
}

export function FormMOD01() {
  const [formData, setFormData] = useState<FormData01>({
    richiedente: '',
    telefono: '',
    email: '',
    repartoDestinatario: '',
    presidioUtilizzo: '',
    descrizione: '',
    quantita: '',
    caratteristicheTecniche: '',
    proceduraDiagnosi: '',
    prestazioniAnnue: '',
    comeVienesvoltaAttualmente: '',
    motivoAcquisizione: '',
    codFuoriUso: '',
    tecnologieStessaTipologia: '',
    specificareTecnologie: '',
    miglioramentiAttesi: '',
    risorseNecessarie: '',
    tipoContratto: '',
    costoAcquisto: '',
    durataLeasing: '',
    durataService: '',
    durataNoleggio: '',
    costoNoleggioServiceLeasing: '',
    costoConsumabili: '',
    progettoFinalizzato: '',
    codProgetto: '',
    note: '',
    dataRichiedente: new Date().toISOString().split('T')[0],
    dataDirettoreUO: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('MOD.01 Submitted:', formData);
    alert('Richiesta inviata a: acquisizione.attrezzaturesanitarie@uslnordovest.toscana.it');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="border-2 border-blue-600 mb-6">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <div className="text-sm font-semibold">DIPARTIMENTO TECNICO</div>
              <div className="text-xs">U.O. TECNOLOGIE</div>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold">MODULO RICHIESTA ATTREZZATURE SANITARIE</h1>
            <p className="text-xs">(ad esclusione delle apparecchiature ecografiche)</p>
            <p className="text-xs mt-1">
              Da inviare a: acquisizione.attrezzaturesanitarie@uslnordovest.toscana.it
            </p>
          </div>
          <div className="text-right text-xs">
            <div className="font-semibold">MOD.01_TS</div>
            <div>Rev. 0</div>
            <div>Del 26/04/2022</div>
            <div>Pag. 1 di 2</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. RICHIEDENTE E COLLOCAZIONE AZIENDALE */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">1 – RICHIEDENTE E COLLOCAZIONE AZIENDALE</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Richiedente *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.richiedente}
                  onChange={e => setFormData({ ...formData, richiedente: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefono *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.telefono}
                  onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">e-mail *</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reparto destinatario *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.repartoDestinatario}
                onChange={e => setFormData({ ...formData, repartoDestinatario: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Presidio Utilizzo *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.presidioUtilizzo}
                onChange={e => setFormData({ ...formData, presidioUtilizzo: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 2. TECNOLOGIA RICHIESTA */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">2 – TECNOLOGIA RICHIESTA</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Descrizione<sup>1</sup> *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.descrizione}
                  onChange={e => setFormData({ ...formData, descrizione: e.target.value })}
                  placeholder="Denominazione della tecnologia richiesta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantità<sup>2</sup> *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.quantita}
                  onChange={e => setFormData({ ...formData, quantita: e.target.value })}
                  placeholder="n°"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Caratteristiche Tecniche principali<sup>3</sup> *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.caratteristicheTecniche}
                onChange={e => setFormData({ ...formData, caratteristicheTecniche: e.target.value })}
                placeholder="Specificare dettagliatamente le caratteristiche e le particolarità della tecnologia richiesta"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Procedura e/o Diagnosi principale di utilizzo<sup>4</sup> *
                </label>
                <textarea
                  required
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.proceduraDiagnosi}
                  onChange={e => setFormData({ ...formData, proceduraDiagnosi: e.target.value })}
                  placeholder="es. 6812 – isteroscopia"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prestazioni annue previste<sup>5</sup> *
                </label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.prestazioniAnnue}
                  onChange={e => setFormData({ ...formData, prestazioniAnnue: e.target.value })}
                  placeholder="n° prestazioni/anno"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Come viene svolta attualmente questa procedura?<sup>6</sup> *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.comeVienesvoltaAttualmente}
                onChange={e => setFormData({ ...formData, comeVienesvoltaAttualmente: e.target.value })}
                placeholder="Dettagliare la metodica attuale di trattamento..."
              />
            </div>
          </div>
        </div>

        {/* 3. MOTIVO ACQUISIZIONE */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">3 – MOTIVO ACQUISIZIONE (effettuare una sola scelta!)</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="motivoAcquisizione"
                    value="incremento"
                    checked={formData.motivoAcquisizione === 'incremento'}
                    onChange={e => setFormData({ ...formData, motivoAcquisizione: 'incremento' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Incremento dotazione tecnologica (nuova acquisizione)</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="motivoAcquisizione"
                    value="sostituzione"
                    checked={formData.motivoAcquisizione === 'sostituzione'}
                    onChange={e => setFormData({ ...formData, motivoAcquisizione: 'sostituzione' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Sostituzione app. fuori uso</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="motivoAcquisizione"
                    value="aggiornamento"
                    checked={formData.motivoAcquisizione === 'aggiornamento'}
                    onChange={e => setFormData({ ...formData, motivoAcquisizione: 'aggiornamento' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Aggiornamento tecnologia</span>
                </label>
              </div>
            </div>

            {(formData.motivoAcquisizione === 'sostituzione' || formData.motivoAcquisizione === 'aggiornamento') && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Cod. Fuori Uso / Richiesta Aggiornamento
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.codFuoriUso}
                  onChange={e => setFormData({ ...formData, codFuoriUso: e.target.value })}
                />
              </div>
            )}

            <div className="border border-gray-300 p-3 bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">
                    Ci sono tecnologie stessa tipologia già in dotazione del reparto utilizzate per la procedura di cui sopra?
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tecnologieStessaTipologia"
                        value="si"
                        checked={formData.tecnologieStessaTipologia === 'si'}
                        onChange={e => setFormData({ ...formData, tecnologieStessaTipologia: 'si' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Sì</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="tecnologieStessaTipologia"
                        value="no"
                        checked={formData.tecnologieStessaTipologia === 'no'}
                        onChange={e => setFormData({ ...formData, tecnologieStessaTipologia: 'no' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
                {formData.tecnologieStessaTipologia === 'si' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Se sì, specificare quali?<sup>7</sup>
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.specificareTecnologie}
                      onChange={e => setFormData({ ...formData, specificareTecnologie: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Miglioramenti attesi<sup>8</sup> (clinici/tecnici/organizzativi) *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.miglioramentiAttesi}
                onChange={e => setFormData({ ...formData, miglioramentiAttesi: e.target.value })}
                placeholder="Definire i miglioramenti attesi dall'implementazione..."
              />
            </div>
          </div>
        </div>

        {/* 4. NECESSITA' ACCESSORIE */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">4 – NECESSITA' ACCESSORIE</h2>
          </div>
          <div className="p-4">
            <label className="block text-sm font-medium mb-1">
              Risorse necessarie all'introduzione della una nuova tecnologia<sup>9</sup>
            </label>
            <p className="text-xs text-gray-600 mb-2">
              (sanitarie, non sanitarie, formazione/aggiornamento o aumento del personale, modifiche strutturali)
            </p>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.risorseNecessarie}
              onChange={e => setFormData({ ...formData, risorseNecessarie: e.target.value })}
              placeholder="Specificare se necessarie ulteriori risorse..."
            />
          </div>
        </div>

        {/* 5. ASPETTI CONTRATTUALI E DI FINANZIAMENTO */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">5 – ASPETTI CONTRATTUALI E DI FINANZIAMENTO<sup>10</sup></h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tipoContratto === 'acquisto'}
                    onChange={e => setFormData({ ...formData, tipoContratto: e.target.checked ? 'acquisto' : '' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Acquisto</span>
                </label>
                {formData.tipoContratto === 'acquisto' && (
                  <div>
                    <label className="block text-sm mb-1">Stima COSTO ACQUISTO</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">€</span>
                      <input
                        type="number"
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.costoAcquisto}
                        onChange={e => setFormData({ ...formData, costoAcquisto: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tipoContratto === 'leasing'}
                    onChange={e => setFormData({ ...formData, tipoContratto: e.target.checked ? 'leasing' : '' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Leasing</span>
                  <span className="text-xs text-gray-600">(Durata in mesi</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={formData.durataLeasing}
                    onChange={e => setFormData({ ...formData, durataLeasing: e.target.value })}
                    disabled={formData.tipoContratto !== 'leasing'}
                  />
                  <span className="text-xs text-gray-600">)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tipoContratto === 'service'}
                    onChange={e => setFormData({ ...formData, tipoContratto: e.target.checked ? 'service' : '' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Service</span>
                  <span className="text-xs text-gray-600">(Durata in mesi</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={formData.durataService}
                    onChange={e => setFormData({ ...formData, durataService: e.target.value })}
                    disabled={formData.tipoContratto !== 'service'}
                  />
                  <span className="text-xs text-gray-600">)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tipoContratto === 'noleggio'}
                    onChange={e => setFormData({ ...formData, tipoContratto: e.target.checked ? 'noleggio' : '' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Noleggio</span>
                  <span className="text-xs text-gray-600">(Durata in mesi</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={formData.durataNoleggio}
                    onChange={e => setFormData({ ...formData, durataNoleggio: e.target.value })}
                    disabled={formData.tipoContratto !== 'noleggio'}
                  />
                  <span className="text-xs text-gray-600">)</span>
                </label>

                {formData.tipoContratto !== 'acquisto' && formData.tipoContratto !== '' && (
                  <>
                    <div>
                      <label className="block text-sm mb-1">Stima COSTO NOLEGGIO/SERVICE/LEASING</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.costoNoleggioServiceLeasing}
                          onChange={e => setFormData({ ...formData, costoNoleggioServiceLeasing: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Stima COSTO Consumabili per Procedura</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.costoConsumabili}
                          onChange={e => setFormData({ ...formData, costoConsumabili: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">
                  Progetto finalizzato?<sup>11</sup>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="progettoFinalizzato"
                    value="si"
                    checked={formData.progettoFinalizzato === 'si'}
                    onChange={e => setFormData({ ...formData, progettoFinalizzato: 'si' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Sì</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="progettoFinalizzato"
                    value="no"
                    checked={formData.progettoFinalizzato === 'no'}
                    onChange={e => setFormData({ ...formData, progettoFinalizzato: 'no' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">No</span>
                </label>
                {formData.progettoFinalizzato === 'si' && (
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm">Se sì, COD. Progetto<sup>12</sup>:</label>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.codProgetto}
                      onChange={e => setFormData({ ...formData, codProgetto: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6. NOTE */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">6 – NOTE<sup>13</sup></h2>
          </div>
          <div className="p-4">
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              placeholder="Indicare eventuali note e/o allegare eventuali schede o documenti a integrazione della scheda"
            />
          </div>
        </div>

        {/* FIRME */}
        <div className="border border-gray-300">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">RICHIEDENTE</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Data</span>
                  <input
                    type="date"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.dataRichiedente}
                    onChange={e => setFormData({ ...formData, dataRichiedente: e.target.value })}
                  />
                  <span className="text-sm">Firma</span>
                  <div className="flex-1 border-b border-gray-400 h-8"></div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">DIRETTORE U.O. - PRESA VISIONE DELLA RICHIESTA</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Data</span>
                    <input
                      type="date"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      value={formData.dataDirettoreUO}
                      onChange={e => setFormData({ ...formData, dataDirettoreUO: e.target.value })}
                    />
                    <span className="text-sm">Firma</span>
                    <div className="flex-1 border-b border-gray-400 h-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AVVISO IMPORTANTE */}
        <div className="border-4 border-black p-4 bg-gray-50">
          <p className="text-center font-bold text-sm">
            N.B.: La compilazione e l'invio del presente modulo non da motivo di acquisto del dispositivo richiesto,
            ma rappresenta l'attivazione del processo di verifica del fabbisogno richiesto
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-600 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Stampa
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <Save className="w-5 h-5" />
            Invia Richiesta
          </button>
        </div>
      </form>

      {/* Footer informativo */}
      <div className="mt-6 text-xs text-gray-600 text-center">
        <p>Spazio Riservato a UO ITAC o UO BPR - ID Richiesta: _____________</p>
      </div>
    </div>
  );
}
