/**
 * Currency Input Component - Accepts Italian number format
 * Allows: 1.234,56 or 1234,56 or 1234.56
 */

import React from 'react';
import { parseItalianNumber, formatItalianNumber, isValidItalianNumber } from '@/lib/numberFormat';

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showEuroSymbol?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = '0,00',
  required = false,
  disabled = false,
  className = '',
  showEuroSymbol = true,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow only valid characters
    if (input && !isValidItalianNumber(input)) {
      return;
    }

    setDisplayValue(input);

    // Parse and store normalized value
    const parsed = parseItalianNumber(input);
    if (!isNaN(parsed) || input === '') {
      onChange(input === '' ? '' : parsed.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    // Format on blur if value is valid
    if (value && !isNaN(parseFloat(value))) {
      const formatted = formatItalianNumber(parseFloat(value), 2);
      setDisplayValue(formatted);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw value when focused for easier editing
    if (value) {
      setDisplayValue(value.replace('.', ','));
    }
  };

  // Update display value when prop changes
  React.useEffect(() => {
    if (!isFocused && value) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        setDisplayValue(formatItalianNumber(num, 2));
      } else {
        setDisplayValue(value);
      }
    }
  }, [value, isFocused]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showEuroSymbol && <span className="text-sm text-gray-700">€</span>}
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        title="Inserisci importo (es: 1.234,56 o 1234,56)"
      />
      {!isFocused && value && (
        <span className="text-xs text-gray-500">
          (formato italiano)
        </span>
      )}
    </div>
  );
}
