/**
 * Utility functions for handling Italian number formats
 * Formato italiano: separatore migliaia = punto (.), separatore decimali = virgola (,)
 */

/**
 * Convert Italian format string to number
 * Examples:
 * - "1.234,56" -> 1234.56
 * - "1234,56" -> 1234.56
 * - "1.234" -> 1234
 * - "1234.56" -> 1234.56 (also accepts US format)
 */
export function parseItalianNumber(value: string): number {
  if (!value) return 0;

  // Remove spaces
  let cleaned = value.trim().replace(/\s/g, '');

  // Check if it contains comma (Italian decimal separator)
  if (cleaned.includes(',')) {
    // Italian format: remove dots (thousands separator) and replace comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  // If no comma, assume dots are decimal separators (US format) or thousands separators
  // If there are multiple dots or a dot with 3+ digits after, it's a thousands separator
  else if ((cleaned.match(/\./g) || []).length > 1 || /\.\d{3,}/.test(cleaned)) {
    // Multiple dots or dot followed by 3+ digits = thousands separator
    cleaned = cleaned.replace(/\./g, '');
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Format number to Italian format string
 * Examples:
 * - 1234.56 -> "1.234,56"
 * - 1234 -> "1.234"
 */
export function formatItalianNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format as currency (Euro)
 * Examples:
 * - 1234.56 -> "€ 1.234,56"
 * - 1234 -> "€ 1.234,00"
 */
export function formatEuro(value: number, showDecimals: boolean = true): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Validate Italian number format
 */
export function isValidItalianNumber(value: string): boolean {
  if (!value) return true;

  // Allow: digits, dots (thousands), commas (decimals), spaces
  const italianPattern = /^[\d\s.,]+$/;
  if (!italianPattern.test(value)) return false;

  // Cannot have multiple commas
  if ((value.match(/,/g) || []).length > 1) return false;

  return true;
}

/**
 * Normalize user input to standard format (remove formatting, keep only valid number)
 * Use this for form inputs to allow both Italian and US formats
 */
export function normalizeNumberInput(value: string): string {
  if (!value) return '';

  const parsed = parseItalianNumber(value);
  if (isNaN(parsed)) return '';

  return parsed.toString();
}
