/**
 * Test della gestione dei numeri in formato italiano (src/lib/numberFormat.ts)
 */

import { describe, test, expect } from 'vitest';
import {
  parseItalianNumber,
  formatItalianNumber,
  formatEuro,
  isValidItalianNumber,
} from '@/lib/numberFormat';

describe('parseItalianNumber', () => {
  test('formato italiano completo: "1.234,56" → 1234.56', () => {
    expect(parseItalianNumber('1.234,56')).toBe(1234.56);
  });

  test('solo virgola: "1234,56" → 1234.56', () => {
    expect(parseItalianNumber('1234,56')).toBe(1234.56);
  });

  test('punto migliaia: "1.234" → 1234', () => {
    expect(parseItalianNumber('1.234')).toBe(1234);
  });

  test('più punti migliaia: "1.234.567" → 1234567', () => {
    expect(parseItalianNumber('1.234.567')).toBe(1234567);
  });

  test('formato US: "1234.56" → 1234.56', () => {
    expect(parseItalianNumber('1234.56')).toBe(1234.56);
  });

  test('stringa vuota → 0', () => {
    expect(parseItalianNumber('')).toBe(0);
  });

  // Ambiguita' nota dell'euristica (finding Fase 2, severita' bassa):
  // "1.5" e' interpretato come 1.5 (decimale US), non 1500. Il test
  // documenta il comportamento attuale perche' i form lo ereditano.
  test('ambiguità documentata: "1.5" → 1.5 (non 1500)', () => {
    expect(parseItalianNumber('1.5')).toBe(1.5);
  });
});

describe('formatItalianNumber / formatEuro', () => {
  // NB CLDR: l'italiano usa minimumGroupingDigits=2, quindi il separatore
  // delle migliaia compare solo da 5 cifre in su (1234 → "1234", 12345 → "12.345")
  test('12345.67 → "12.345,67"', () => {
    expect(formatItalianNumber(12345.67)).toBe('12.345,67');
  });

  test('1234.56 → "1234,56" (nessun separatore sotto le 5 cifre)', () => {
    expect(formatItalianNumber(1234.56)).toBe('1234,56');
  });

  test('formatEuro contiene importo e simbolo euro', () => {
    const s = formatEuro(12345.5);
    expect(s).toContain('12.345,50');
    expect(s).toContain('€');
  });
});

describe('isValidItalianNumber', () => {
  test('accetta formato italiano', () => {
    expect(isValidItalianNumber('1.234,56')).toBe(true);
  });

  test('rifiuta lettere', () => {
    expect(isValidItalianNumber('12a4')).toBe(false);
  });

  test('rifiuta doppia virgola', () => {
    expect(isValidItalianNumber('1,2,3')).toBe(false);
  });
});
