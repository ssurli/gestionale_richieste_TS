/**
 * Test delle validazioni normative (src/lib/validations.ts)
 * DGR 306/2024 (donazioni, vendor lock-in), coerenza budget e richiesta.
 */

import { describe, test, expect } from 'vitest';
import {
  validaDGR306_2024,
  validaServiceContract,
  validaConsumabili,
  validaBudget,
  validaCoerenzaRichiesta,
  validaProcurement,
} from '@/lib/validations';
import { Donation, ServiceContract, Consumables, BudgetCoverage } from '@/types';

function donazioneBase(overrides: Partial<Donation> = {}): Donation {
  return {
    donatoreIdentificato: true,
    valoreDonazione: 20000,
    materialiUsoDecicati: false,
    conformeDGR306: true,
    tecnologiaGiaAggiudicata: true,
    tecnologiaConosciuta: true,
    eligibileProceduraSemplificata: true,
    ...overrides,
  };
}

function serviceBase(overrides: Partial<ServiceContract> = {}): ServiceContract {
  return {
    serviceGiaAggiudicatoESTAR: true,
    numeroDeliberaESTAR: 'DEL-123',
    fornitore: 'Fornitore SpA',
    durataContrattualeAnni: 3,
    canoneAnnuo: 10000,
    valoreTotaleContratto: 30000,
    consumabiliInclusi: 'GENERICI',
    penaliUscitaAnticipata: false,
    tipoRichiestaService: 'RINNOVO',
    ...overrides,
  };
}

function consumabiliBase(overrides: Partial<Consumables> = {}): Consumables {
  return {
    consumabiliGiaGaraESTAR: true,
    numeroDeliberaESTAR: 'DEL-456',
    tipologia: 'Elettrodi',
    fornitore: 'Fornitore SpA',
    consumoAnnuoStimato: 10000,
    tipoConsumabile: 'GENERICI',
    motivazioneRichiesta: 'INCREMENTO_VOLUMI',
    percentualeIncremento: 10,
    esistonoAlternative: true,
    ...overrides,
  };
}

function budgetBase(overrides: Partial<BudgetCoverage> = {}): BudgetCoverage {
  return {
    valoreStimatoEuro: 30000,
    ivaEsclusa: true,
    fonteFinanziamento: 'PIANO_INVESTIMENTI',
    annoRiferimento: new Date().getFullYear(),
    budgetDisponibile: true,
    richiestaIntegrazione: false,
    validatoUSLPM: false,
    ...overrides,
  };
}

describe('validaDGR306_2024 (donazioni)', () => {
  test('donazione conforme → valida', () => {
    expect(validaDGR306_2024(donazioneBase()).isValid).toBe(true);
  });

  test('materiali d\'uso dedicati → VIOLAZIONE bloccante', () => {
    const res = validaDGR306_2024(donazioneBase({ materialiUsoDecicati: true }));
    expect(res.isValid).toBe(false);
    expect(res.errors.join(' ')).toContain('DGR 306/2024');
  });

  test('donatore non identificato → errore', () => {
    expect(validaDGR306_2024(donazioneBase({ donatoreIdentificato: false })).isValid).toBe(false);
  });

  test('valore nullo → errore', () => {
    expect(validaDGR306_2024(donazioneBase({ valoreDonazione: 0 })).isValid).toBe(false);
  });

  test('valore ≥ €50.000 → warning HTA completo', () => {
    const res = validaDGR306_2024(donazioneBase({ valoreDonazione: 60000 }));
    expect(res.isValid).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});

describe('validaServiceContract', () => {
  test('service coerente → valido', () => {
    expect(validaServiceContract(serviceBase()).isValid).toBe(true);
  });

  test('rinnovo senza aggiudicazione ESTAR → errore', () => {
    const res = validaServiceContract(
      serviceBase({ serviceGiaAggiudicatoESTAR: false, tipoRichiestaService: 'RINNOVO' })
    );
    expect(res.isValid).toBe(false);
  });

  test('valore totale incoerente con canone × durata → errore', () => {
    const res = validaServiceContract(serviceBase({ valoreTotaleContratto: 99999 }));
    expect(res.isValid).toBe(false);
  });

  test('penali dichiarate senza percentuale → errore', () => {
    const res = validaServiceContract(serviceBase({ penaliUscitaAnticipata: true }));
    expect(res.isValid).toBe(false);
  });

  test('consumabili dedicati → warning vendor lock-in', () => {
    const res = validaServiceContract(serviceBase({ consumabiliInclusi: 'DEDICATI' }));
    expect(res.warnings.join(' ')).toContain('VENDOR LOCK-IN');
  });

  test('service ESTAR senza numero delibera → errore', () => {
    const res = validaServiceContract(serviceBase({ numeroDeliberaESTAR: undefined }));
    expect(res.isValid).toBe(false);
  });
});

describe('validaConsumabili', () => {
  test('consumabili coerenti → validi', () => {
    expect(validaConsumabili(consumabiliBase()).isValid).toBe(true);
  });

  test('incremento volumi senza percentuale → errore', () => {
    const res = validaConsumabili(consumabiliBase({ percentualeIncremento: undefined }));
    expect(res.isValid).toBe(false);
  });

  test('motivazione ALTRO senza dettaglio → errore', () => {
    const res = validaConsumabili(
      consumabiliBase({ motivazioneRichiesta: 'ALTRO', altroMotivo: undefined })
    );
    expect(res.isValid).toBe(false);
  });

  test('dedicati senza alternative → warning lock-in critico', () => {
    const res = validaConsumabili(
      consumabiliBase({ tipoConsumabile: 'DEDICATI', esistonoAlternative: false })
    );
    expect(res.warnings.join(' ')).toContain('VENDOR LOCK-IN');
  });
});

describe('validaBudget', () => {
  test('budget coerente → valido', () => {
    expect(validaBudget(budgetBase()).isValid).toBe(true);
  });

  test('budget non disponibile senza richiesta integrazione → errore', () => {
    const res = validaBudget(budgetBase({ budgetDisponibile: false, richiestaIntegrazione: false }));
    expect(res.isValid).toBe(false);
  });

  test('importo disponibile insufficiente senza integrazione → errore', () => {
    const res = validaBudget(
      budgetBase({ importoDisponibile: 10000, valoreStimatoEuro: 30000, richiestaIntegrazione: false })
    );
    expect(res.isValid).toBe(false);
  });

  test('anno di riferimento passato → errore', () => {
    const res = validaBudget(budgetBase({ annoRiferimento: new Date().getFullYear() - 1 }));
    expect(res.isValid).toBe(false);
  });
});

describe('validaProcurement (D.Lgs. 36/2023)', () => {
  test('CIG valido (10 alfanumerici) → ok', () => {
    expect(validaProcurement({ cig: '1234567890', rup: 'Rossi' }).isValid).toBe(true);
    expect(validaProcurement({ cig: 'A1B2C3D4E5', rup: 'Rossi' }).isValid).toBe(true);
  });

  test('CIG con lunghezza errata → errore', () => {
    expect(validaProcurement({ cig: '123' }).isValid).toBe(false);
    expect(validaProcurement({ cig: '1234567890A' }).isValid).toBe(false);
  });

  test('CUP valido (15 alfanumerici) → ok', () => {
    expect(validaProcurement({ cup: 'B12H34567890123' }).isValid).toBe(true);
  });

  test('CUP con lunghezza errata → errore', () => {
    expect(validaProcurement({ cup: 'ABC' }).isValid).toBe(false);
  });

  test('CIG senza RUP → warning (non bloccante)', () => {
    const r = validaProcurement({ cig: '1234567890' });
    expect(r.isValid).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  test('nessun dato → valido (compilazione post-approvazione)', () => {
    expect(validaProcurement({}).isValid).toBe(true);
  });
});

describe('validaCoerenzaRichiesta (regole incrociate DGR 306/2024)', () => {
  test('donazione + service con consumabili dedicati → VIOLAZIONE bloccante', () => {
    const res = validaCoerenzaRichiesta({
      isDonazione: true,
      donazione: donazioneBase(),
      richiedeService: true,
      service: serviceBase({ consumabiliInclusi: 'DEDICATI' }),
      richiedeConsumabili: false,
      budget: budgetBase({ fonteFinanziamento: 'DONAZIONE' }),
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.join(' ')).toContain('DGR 306/2024');
  });

  test('donazione con materiali dedicati → VIOLAZIONE bloccante', () => {
    const res = validaCoerenzaRichiesta({
      isDonazione: true,
      donazione: donazioneBase({ materialiUsoDecicati: true }),
      richiedeService: false,
      richiedeConsumabili: false,
      budget: budgetBase({ fonteFinanziamento: 'DONAZIONE' }),
    });
    expect(res.isValid).toBe(false);
  });

  test('donazione con fonte diversa da DONAZIONE → warning', () => {
    const res = validaCoerenzaRichiesta({
      isDonazione: true,
      donazione: donazioneBase(),
      richiedeService: false,
      richiedeConsumabili: false,
      budget: budgetBase({ fonteFinanziamento: 'PIANO_INVESTIMENTI' }),
    });
    expect(res.isValid).toBe(true);
    expect(res.warnings.length).toBeGreaterThan(0);
  });

  test('service che include consumabili + richiesta consumabili separata → warning duplicazione', () => {
    const res = validaCoerenzaRichiesta({
      isDonazione: false,
      richiedeService: true,
      service: serviceBase({ consumabiliInclusi: 'GENERICI' }),
      richiedeConsumabili: true,
      consumabili: consumabiliBase(),
      budget: budgetBase(),
    });
    expect(res.warnings.length).toBeGreaterThan(0);
  });
});
