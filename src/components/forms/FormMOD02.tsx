'use client';

import React, { useState } from 'react';
import { FileText, Printer, Save, Plus, Trash2 } from 'lucide-react';

/**
 * MOD.02_TS - MODULO RICHIESTA ACQUISTO/SOSTITUZIONE/AGGIORNAMENTO ECOGRAFI
 *
 * Form fedele al modulo PDF originale per ecografi
 */

interface Trasduttore {
  tipologia: string;
  quantita: string;
}

interface PersonaleMedico {
  nominativo: string;
}

interface ApparecchiaturaEsistente {
  numeroInventario: string;
  marca: string;
  modello: string;
  trasduttori: string;
}

interface FormData02 {
  // 1. RICHIEDENTE E COLLOCAZIONE AZIENDALE
  richiedente: string;
  telefono: string;
  email: string;
  repartoDestinatario: string;
  presidioUtilizzo: string;

  // 2. TECNOLOGIA RICHIESTA
  caratteristicheTecniche: string;
  trasduttori: Trasduttore[];

  // 3. MOTIVO ACQUISIZIONE
  motivoAcquisizione: 'incremento' | 'sostituzione' | 'aggiornamento' | '';
  codFuoriUso: string;
  apparecchiatureDaSostituire: string;
  accessori: string;
  miglioramentiAttesi: string;

  // 4. VALUTAZIONE FABBISOGNO
  valutazioneQualitativa: string;
  tipologiaAttivita: 'mono' | 'multi' | '';
  specificaMono: string;
  specificaMulti: string;
  provenienzaUtenza: string;
  modalitaAccesso: string;
  volumiAttivita: string;
  volumiPrevisti: string;
  possibilitaCUP: 'si' | 'no' | '';
  oreCUPSettimanali: string;
  personaleMedico: PersonaleMedico[];
  turnazioneSettimanale: string;
  apparecchiaturaEsistenti: ApparecchiaturaEsistente[];
  disponibilitaLocaliProssimi: 'si' | 'no' | '';
  specificaLocaliProssimi: string;
  comeVienesvoltaAttualmente: string;

  // 5. NECESSITA' ACCESSORIE
  risorseNecessarie: string;
  modalitaProduzione: string;
  localeInstallazione: string;

  // 6. ASPETTI CONTRATTUALI
  tipoContratto: 'acquisto' | 'leasing' | 'service' | 'noleggio' | '';
  costoAcquisto: string;
  durataLeasing: string;
  durataService: string;
  durataNoleggio: string;
  costoNoleggioServiceLeasing: string;
  costoConsumabili: string;
  progettoFinalizzato: 'si' | 'no' | '';
  codProgetto: string;

  // 7. NOTE
  note: string;

  // FIRME
  dataRichiedente: string;
  dataDirettoreUO: string;
}

export function FormMOD02() {
  const [formData, setFormData] = useState<FormData02>({
    richiedente: '',
    telefono: '',
    email: '',
    repartoDestinatario: '',
    presidioUtilizzo: '',
    caratteristicheTecniche: '',
    trasduttori: [{ tipologia: '', quantita: '' }],
    motivoAcquisizione: '',
    codFuoriUso: '',
    apparecchiatureDaSostituire: '',
    accessori: '',
    miglioramentiAttesi: '',
    valutazioneQualitativa: '',
    tipologiaAttivita: '',
    specificaMono: '',
    specificaMulti: '',
    provenienzaUtenza: '',
    modalitaAccesso: '',
    volumiAttivita: '',
    volumiPrevisti: '',
    possibilitaCUP: '',
    oreCUPSettimanali: '',
    personaleMedico: [{ nominativo: '' }],
    turnazioneSettimanale: '',
    apparecchiaturaEsistenti: [{ numeroInventario: '', marca: '', modello: '', trasduttori: '' }],
    disponibilitaLocaliProssimi: '',
    specificaLocaliProssimi: '',
    comeVienesvoltaAttualmente: '',
    risorseNecessarie: '',
    modalitaProduzione: '',
    localeInstallazione: '',
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

  const addTrasduttore = () => {
    setFormData({
      ...formData,
      trasduttori: [...formData.trasduttori, { tipologia: '', quantita: '' }]
    });
  };

  const removeTrasduttore = (index: number) => {
    const newTrasduttori = formData.trasduttori.filter((_, i) => i !== index);
    setFormData({ ...formData, trasduttori: newTrasduttori });
  };

  const addPersonale = () => {
    setFormData({
      ...formData,
      personaleMedico: [...formData.personaleMedico, { nominativo: '' }]
    });
  };

  const removePersonale = (index: number) => {
    const newPersonale = formData.personaleMedico.filter((_, i) => i !== index);
    setFormData({ ...formData, personaleMedico: newPersonale });
  };

  const addApparecchiatura = () => {
    setFormData({
      ...formData,
      apparecchiaturaEsistenti: [...formData.apparecchiaturaEsistenti, { numeroInventario: '', marca: '', modello: '', trasduttori: '' }]
    });
  };

  const removeApparecchiatura = (index: number) => {
    const newApparecchiature = formData.apparecchiaturaEsistenti.filter((_, i) => i !== index);
    setFormData({ ...formData, apparecchiaturaEsistenti: newApparecchiature });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('MOD.02 Submitted:', formData);
    alert('Richiesta ECOGRAFO inviata a: acquisizione.attrezzaturesanitarie@uslnordovest.toscana.it');
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
            <h1 className="text-xl font-bold">MODULO RICHIESTA</h1>
            <h2 className="text-lg font-bold">ACQUISTO/SOSTITUZIONE/AGGIORNAMENTO ECOGRAFI</h2>
            <p className="text-xs mt-1">
              Da inviare a: acquisizione.attrezzaturesanitarie@uslnordovest.toscana.it
            </p>
          </div>
          <div className="text-right text-xs">
            <div className="font-semibold">MOD.02_TS</div>
            <div>Rev. 1</div>
            <div>Del 18/07/2022</div>
            <div>Pag. 1 di 5</div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.richiedente}
                  onChange={e => setFormData({ ...formData, richiedente: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefono *</label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reparto destinatario *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.repartoDestinatario}
                onChange={e => setFormData({ ...formData, repartoDestinatario: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Presidio Utilizzo *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Caratteristiche Tecniche principali<sup>1</sup> *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.caratteristicheTecniche}
                onChange={e => setFormData({ ...formData, caratteristicheTecniche: e.target.value })}
                placeholder="Descrivere la tipologia di Ecotomografo richiesto e le caratteristiche funzionali necessarie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipologia di trasduttori richiesti<sup>2</sup> *
              </label>
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-semibold">Tipologia</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold w-32">Quantità<sup>3</sup></th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.trasduttori.map((trasd, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            required
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            value={trasd.tipologia}
                            onChange={e => {
                              const newTrasduttori = [...formData.trasduttori];
                              newTrasduttori[index].tipologia = e.target.value;
                              setFormData({ ...formData, trasduttori: newTrasduttori });
                            }}
                            placeholder="Es: Lineare, Convex..."
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            required
                            min="1"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            value={trasd.quantita}
                            onChange={e => {
                              const newTrasduttori = [...formData.trasduttori];
                              newTrasduttori[index].quantita = e.target.value;
                              setFormData({ ...formData, trasduttori: newTrasduttori });
                            }}
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          {formData.trasduttori.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTrasduttore(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addTrasduttore}
                className="mt-2 flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
                Aggiungi trasduttore
              </button>
            </div>
          </div>
        </div>

        {/* 3. MOTIVO ACQUISIZIONE */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">3 – MOTIVO ACQUISIZIONE</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="motivoAcquisizione"
                    value="incremento"
                    checked={formData.motivoAcquisizione === 'incremento'}
                    onChange={() => setFormData({ ...formData, motivoAcquisizione: 'incremento' })}
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
                    onChange={() => setFormData({ ...formData, motivoAcquisizione: 'sostituzione' })}
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
                    onChange={() => setFormData({ ...formData, motivoAcquisizione: 'aggiornamento' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Aggiornamento tecnologia</span>
                </label>
              </div>
            </div>

            {(formData.motivoAcquisizione === 'sostituzione' || formData.motivoAcquisizione === 'aggiornamento') && (
              <div className="space-y-3 border-t pt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cod. Fuori Uso / Richiesta Aggiornamento<sup>4</sup>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    value={formData.codFuoriUso}
                    onChange={e => setFormData({ ...formData, codFuoriUso: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Apparecchiature da sostituire<sup>5</sup>
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.apparecchiatureDaSostituire}
                      onChange={e => setFormData({ ...formData, apparecchiatureDaSostituire: e.target.value })}
                      placeholder="N° inventario e tipologia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Accessori<sup>6</sup>
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.accessori}
                      onChange={e => setFormData({ ...formData, accessori: e.target.value })}
                      placeholder="Trasduttori, stampante, ecc."
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Miglioramenti attesi<sup>7</sup> (clinici/tecnici/organizzativi) *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.miglioramentiAttesi}
                onChange={e => setFormData({ ...formData, miglioramentiAttesi: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 4. VALUTAZIONE FABBISOGNO */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">4 – VALUTAZIONE FABBISOGNO</h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Valutazione Qualitativa del fabbisogno<sup>8</sup> *
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.valutazioneQualitativa}
                onChange={e => setFormData({ ...formData, valutazioneQualitativa: e.target.value })}
                placeholder="Motivare la necessità di fabbisogno di esami"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tipologia attività svolta dalla struttura<sup>9</sup> *
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="tipologiaAttivita"
                    value="mono"
                    checked={formData.tipologiaAttivita === 'mono'}
                    onChange={() => setFormData({ ...formData, tipologiaAttivita: 'mono' })}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Mono-specialistica,</span>
                    <input
                      type="text"
                      className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm w-96"
                      placeholder="specificare cosa:"
                      value={formData.specificaMono}
                      onChange={e => setFormData({ ...formData, specificaMono: e.target.value })}
                      disabled={formData.tipologiaAttivita !== 'mono'}
                    />
                  </div>
                </label>
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="tipologiaAttivita"
                    value="multi"
                    checked={formData.tipologiaAttivita === 'multi'}
                    onChange={() => setFormData({ ...formData, tipologiaAttivita: 'multi' })}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">Multi-specialistica,</span>
                    <input
                      type="text"
                      className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm w-96"
                      placeholder="specificare cosa:"
                      value={formData.specificaMulti}
                      onChange={e => setFormData({ ...formData, specificaMulti: e.target.value })}
                      disabled={formData.tipologiaAttivita !== 'multi'}
                    />
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Provenienza utenza<sup>10</sup>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.provenienzaUtenza}
                  onChange={e => setFormData({ ...formData, provenienzaUtenza: e.target.value })}
                  placeholder="interni, esterni, altro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Modalità accesso alle prestazioni per l'utenza<sup>11</sup>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.modalitaAccesso}
                  onChange={e => setFormData({ ...formData, modalitaAccesso: e.target.value })}
                  placeholder="CUP, altri reparti, ecc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Volumi attività media/annuale<sup>12</sup>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.volumiAttivita}
                  onChange={e => setFormData({ ...formData, volumiAttivita: e.target.value })}
                  placeholder="n° prestazioni/anno"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  In caso di implementazione di attività, riportare i volumi di attività previsti<sup>13</sup>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.volumiPrevisti}
                  onChange={e => setFormData({ ...formData, volumiPrevisti: e.target.value })}
                  placeholder="n° prestazioni previste"
                />
              </div>
            </div>

            <div className="border border-gray-300 p-3 bg-gray-50">
              <label className="block text-sm font-medium mb-2">
                Nel caso di nuova attività, possibilità offerta al CUP Aziendale?<sup>14</sup>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="possibilitaCUP"
                    value="si"
                    checked={formData.possibilitaCUP === 'si'}
                    onChange={() => setFormData({ ...formData, possibilitaCUP: 'si' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Sì</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="possibilitaCUP"
                    value="no"
                    checked={formData.possibilitaCUP === 'no'}
                    onChange={() => setFormData({ ...formData, possibilitaCUP: 'no' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">No</span>
                </label>
                {formData.possibilitaCUP === 'si' && (
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm">Se sì specificare ore di attività settimanale per esterni:</label>
                    <input
                      type="text"
                      className="px-2 py-1 border border-gray-300 rounded"
                      value={formData.oreCUPSettimanali}
                      onChange={e => setFormData({ ...formData, oreCUPSettimanali: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* NOMINATIVO PERSONALE MEDICO */}
            <div>
              <label className="block text-sm font-medium mb-2">
                NOMINATIVO PERSONALE MEDICO QUALIFICATO E DISPONIBILE PER ATTIVITA' ECOGRAFICA<sup>15</sup>
              </label>
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-semibold">N°</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold">Nominativo</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.personaleMedico.map((medico, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            value={medico.nominativo}
                            onChange={e => {
                              const newPersonale = [...formData.personaleMedico];
                              newPersonale[index].nominativo = e.target.value;
                              setFormData({ ...formData, personaleMedico: newPersonale });
                            }}
                            placeholder="Nome e cognome medico"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          {formData.personaleMedico.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePersonale(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addPersonale}
                className="mt-2 flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
                Aggiungi medico
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Turnazione settimanale e fasce orarie di attività previste
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.turnazioneSettimanale}
                onChange={e => setFormData({ ...formData, turnazioneSettimanale: e.target.value })}
              />
            </div>

            {/* ALTRE APPARECCHIATURE ECOGRAFICHE */}
            <div>
              <label className="block text-sm font-medium mb-2">
                ALTRE APPARECCHIATURE ECOGRAFICHE IN DOTAZIONE ALLA STRUTTURA<sup>16</sup>
              </label>
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-sm font-semibold">Prog</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold">n° inventario</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold">marca</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold">modello</th>
                      <th className="px-3 py-2 text-left text-sm font-semibold">Trasduttori in dotazione</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.apparecchiaturaEsistenti.map((app, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-3 py-2 text-sm">{index + 1}</td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            value={app.numeroInventario}
                            onChange={e => {
                              const newApp = [...formData.apparecchiaturaEsistenti];
                              newApp[index].numeroInventario = e.target.value;
                              setFormData({ ...formData, apparecchiaturaEsistenti: newApp });
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            value={app.marca}
                            onChange={e => {
                              const newApp = [...formData.apparecchiaturaEsistenti];
                              newApp[index].marca = e.target.value;
                              setFormData({ ...formData, apparecchiaturaEsistenti: newApp });
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            value={app.modello}
                            onChange={e => {
                              const newApp = [...formData.apparecchiaturaEsistenti];
                              newApp[index].modello = e.target.value;
                              setFormData({ ...formData, apparecchiaturaEsistenti: newApp });
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            value={app.trasduttori}
                            onChange={e => {
                              const newApp = [...formData.apparecchiaturaEsistenti];
                              newApp[index].trasduttori = e.target.value;
                              setFormData({ ...formData, apparecchiaturaEsistenti: newApp });
                            }}
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          {formData.apparecchiaturaEsistenti.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeApparecchiatura(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                onClick={addApparecchiatura}
                className="mt-2 flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-300 rounded hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
                Aggiungi apparecchiatura
              </button>
            </div>

            <div className="border border-gray-300 p-3 bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    Disponibilità di app. ecografiche in locali prossimi e contigui anche se in uso ad altri reparti o altre specialistiche
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="disponibilitaLocaliProssimi"
                        value="si"
                        checked={formData.disponibilitaLocaliProssimi === 'si'}
                        onChange={() => setFormData({ ...formData, disponibilitaLocaliProssimi: 'si' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Sì</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="disponibilitaLocaliProssimi"
                        value="no"
                        checked={formData.disponibilitaLocaliProssimi === 'no'}
                        onChange={() => setFormData({ ...formData, disponibilitaLocaliProssimi: 'no' })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
                {formData.disponibilitaLocaliProssimi === 'si' && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Se sì, specificare quali e dove<sup>17</sup>
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      value={formData.specificaLocaliProssimi}
                      onChange={e => setFormData({ ...formData, specificaLocaliProssimi: e.target.value })}
                      placeholder="N° inventario e localizzazione"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Come viene svolta attualmente questa procedura?<sup>18</sup>
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.comeVienesvoltaAttualmente}
                onChange={e => setFormData({ ...formData, comeVienesvoltaAttualmente: e.target.value })}
                placeholder="Dettagliare brevemente la metodica attuale di diagnosi..."
              />
            </div>
          </div>
        </div>

        {/* 5. NECESSITA' ACCESSORIE */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">5 – NECESSITA' ACCESSORIE (nel caso di nuova acquisizione)</h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Risorse necessarie all'introduzione della una nuova tecnologia<sup>19</sup>
              </label>
              <p className="text-xs text-gray-600 mb-1">
                (sanitarie, non sanitarie, formazione/aggiornamento o aumento del personale, modifiche strutturali)
              </p>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.risorseNecessarie}
                onChange={e => setFormData({ ...formData, risorseNecessarie: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Modalità di produzione, consegna e archiviazione delle risultanze e fruibilità delle stesse da parte di altri operatori
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.modalitaProduzione}
                onChange={e => setFormData({ ...formData, modalitaProduzione: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Locale di installazione e eventuali necessità impiantistiche necessarie<sup>20</sup>
              </label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                value={formData.localeInstallazione}
                onChange={e => setFormData({ ...formData, localeInstallazione: e.target.value })}
                placeholder="Punti presa, rete dati, dimensioni locale, ecc."
              />
            </div>
          </div>
        </div>

        {/* 6. ASPETTI CONTRATTUALI */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">6 – ASPETTI CONTRATTUALI E DI FINANZIAMENTO<sup>21</sup></h2>
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
                    <label className="block text-sm mb-1">Stima COSTO ACQUISTO (IVA esclusa)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">€</span>
                      <input
                        type="number"
                        step="0.01"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        value={formData.costoAcquisto}
                        onChange={e => setFormData({ ...formData, costoAcquisto: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tipoContratto === 'leasing'}
                    onChange={e => setFormData({ ...formData, tipoContratto: e.target.checked ? 'leasing' : '' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Leasing (Durata in mesi</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={formData.durataLeasing}
                    onChange={e => setFormData({ ...formData, durataLeasing: e.target.value })}
                    disabled={formData.tipoContratto !== 'leasing'}
                  />
                  <span className="text-sm font-medium">)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tipoContratto === 'service'}
                    onChange={e => setFormData({ ...formData, tipoContratto: e.target.checked ? 'service' : '' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Service (Durata in mesi</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={formData.durataService}
                    onChange={e => setFormData({ ...formData, durataService: e.target.value })}
                    disabled={formData.tipoContratto !== 'service'}
                  />
                  <span className="text-sm font-medium">)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tipoContratto === 'noleggio'}
                    onChange={e => setFormData({ ...formData, tipoContratto: e.target.checked ? 'noleggio' : '' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Noleggio (Durata in mesi</span>
                  <input
                    type="number"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={formData.durataNoleggio}
                    onChange={e => setFormData({ ...formData, durataNoleggio: e.target.value })}
                    disabled={formData.tipoContratto !== 'noleggio'}
                  />
                  <span className="text-sm font-medium">)</span>
                </label>

                {formData.tipoContratto !== 'acquisto' && formData.tipoContratto !== '' && (
                  <>
                    <div>
                      <label className="block text-sm mb-1">Stima COSTO NOLEGGIO/SERVICE/LEASING (IVA esclusa)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                          value={formData.costoNoleggioServiceLeasing}
                          onChange={e => setFormData({ ...formData, costoNoleggioServiceLeasing: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Stima COSTO Consumabili per Procedura (IVA esclusa)</label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">€</span>
                        <input
                          type="number"
                          step="0.01"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                          value={formData.costoConsumabili}
                          onChange={e => setFormData({ ...formData, costoConsumabili: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">
                  Progetto finalizzato?<sup>22</sup>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="progettoFinalizzato"
                    value="si"
                    checked={formData.progettoFinalizzato === 'si'}
                    onChange={() => setFormData({ ...formData, progettoFinalizzato: 'si' })}
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
                    onChange={() => setFormData({ ...formData, progettoFinalizzato: 'no' })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">No</span>
                </label>
                {formData.progettoFinalizzato === 'si' && (
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-sm">Se sì, COD. Progetto<sup>23</sup>:</label>
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      value={formData.codProgetto}
                      onChange={e => setFormData({ ...formData, codProgetto: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 7. NOTE */}
        <div className="border border-gray-300">
          <div className="bg-blue-100 border-b border-gray-300 p-2">
            <h2 className="font-bold text-sm">7 – NOTE<sup>24</sup></h2>
          </div>
          <div className="p-4">
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              placeholder="Indicare eventuali note e/o allegare eventuali schede o documenti a integrazione della scheda"
            />
          </div>
        </div>

        {/* FIRME */}
        <div className="border border-gray-300">
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">RICHIEDENTE</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">Data</span>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  value={formData.dataRichiedente}
                  onChange={e => setFormData({ ...formData, dataRichiedente: e.target.value })}
                />
                <span className="text-sm">Firma</span>
                <div className="flex-1 border-b border-gray-400 h-8"></div>
              </div>
            </div>
            <div className="bg-gray-100 p-3">
              <label className="block text-sm font-medium mb-1">DIRETTORE U.O. - PRESA VISIONE DELLA RICHIESTA</label>
              <div className="flex items-center gap-2">
                <span className="text-sm">Data</span>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.dataDirettoreUO}
                  onChange={e => setFormData({ ...formData, dataDirettoreUO: e.target.value })}
                />
                <span className="text-sm">Firma</span>
                <div className="flex-1 border-b border-gray-400 h-8"></div>
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

      {/* Footer */}
      <div className="mt-6 text-xs text-gray-600 text-center">
        <p>Spazio Riservato a UO ITAC o UO BPR - ID Richiesta: _____________</p>
      </div>
    </div>
  );
}
