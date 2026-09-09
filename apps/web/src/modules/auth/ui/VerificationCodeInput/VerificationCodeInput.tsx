import { useState, useRef, useEffect } from 'react';
import type { VerificationCodeInputProps } from './VerificationCodeInput.types';
import styles from './VerificationCodeInput.module.css';

export function VerificationCodeInput({
  value = '',
  onChange,
  onComplete,
  length = 6,
  error,
  disabled = false,
  autoFocus = false,
  className = '',
  id,
}: VerificationCodeInputProps) {
  // Maintain internal digits state to ensure immediate UI updates and reactivity
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length }, (_, i) => value[i] || '')
  );

  const [shouldShake, setShouldShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasAutoFocusedRef = useRef(false);
  const prevDisabledRef = useRef(disabled);

  // Trigger brief shake animation whenever an error occurs
  useEffect(() => {
    if (error) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Focus on the last input when an attempt fails
  useEffect(() => {
    if (error && !disabled) {
      inputRefs.current[length - 1]?.focus();
      inputRefs.current[length - 1]?.select();
    }
  }, [error, disabled, length]);

  // Synchronize internal state when external value changes
  useEffect(() => {
    const currentJoined = digits.join('');
    if (value !== currentJoined) {
      setDigits(Array.from({ length }, (_, i) => value[i] || ''));
    }
  }, [value, length]);

  // Automatically focus on the first empty input only on initial activation
  useEffect(() => {
    if (autoFocus && !disabled && !hasAutoFocusedRef.current) {
      hasAutoFocusedRef.current = true;
      const firstEmptyIndex = digits.findIndex((d) => !d);
      const targetIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
      inputRefs.current[targetIndex]?.focus();
      inputRefs.current[targetIndex]?.select();
    } else if (!autoFocus) {
      hasAutoFocusedRef.current = false;
    }
  }, [autoFocus, disabled]);

  // Maintain focus on the last input when re-enabling after failed submission
  useEffect(() => {
    const wasDisabled = prevDisabledRef.current;
    prevDisabledRef.current = disabled;

    if (wasDisabled && !disabled && error) {
      inputRefs.current[length - 1]?.focus();
      inputRefs.current[length - 1]?.select();
    }
  }, [disabled, error, length]);

  const updateDigits = (nextDigits: string[]) => {
    setDigits(nextDigits);
    const joined = nextDigits.join('');
    onChange(joined);
    if (nextDigits.length === length && nextDigits.every((d) => d !== '')) {
      onComplete?.(joined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (disabled) return;

    // Arrow left: move focus to previous input
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        inputRefs.current[index - 1]?.select();
      }
      return;
    }

    // Arrow right: move focus to next input
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.select();
      }
      return;
    }

    // Backspace handling
    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentDigit = digits[index];

      if (currentDigit) {
        // Erase current input, keep focus on it
        const nextDigits = [...digits];
        nextDigits[index] = '';
        updateDigits(nextDigits);
      } else {
        // Current input is already empty: erase previous input and move focus to it
        if (index > 0) {
          const nextDigits = [...digits];
          nextDigits[index - 1] = '';
          updateDigits(nextDigits);
          inputRefs.current[index - 1]?.focus();
          inputRefs.current[index - 1]?.select();
        }
      }
      return;
    }

    // Delete key handling
    if (e.key === 'Delete') {
      e.preventDefault();
      if (digits[index]) {
        const nextDigits = [...digits];
        nextDigits[index] = '';
        updateDigits(nextDigits);
      }
      return;
    }

    // Digit entry (0-9)
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index] = e.key;
      updateDigits(nextDigits);

      // Move focus to next input if available
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.select();
      }
      return;
    }

    // Block non-numeric characters (single character keys without modifier combinations)
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (disabled) return;

    const rawVal = e.target.value;
    const sanitized = rawVal.replace(/\D/g, '');

    if (!sanitized) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      updateDigits(nextDigits);
      return;
    }

    // Handle multiple digits (e.g., from mobile virtual keyboards or autofill)
    if (sanitized.length > 1) {
      const nextDigits = [...digits];
      for (let i = 0; i < sanitized.length && index + i < length; i++) {
        nextDigits[index + i] = sanitized[i];
      }
      updateDigits(nextDigits);
      const target = Math.min(length - 1, index + sanitized.length);
      inputRefs.current[target]?.focus();
      inputRefs.current[target]?.select();
      return;
    }

    // Single digit fallback
    const nextDigits = [...digits];
    nextDigits[index] = sanitized;
    updateDigits(nextDigits);

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    if (disabled) return;

    const pastedText = e.clipboardData.getData('text');
    const sanitized = pastedText.replace(/\D/g, '');
    if (!sanitized) return;

    const nextDigits = [...digits];

    // If pasted code has at least the full length, fill all slots starting from index 0
    if (sanitized.length >= length) {
      const fullCode = sanitized.slice(0, length);
      for (let i = 0; i < length; i++) {
        nextDigits[i] = fullCode[i];
      }
      updateDigits(nextDigits);
      inputRefs.current[length - 1]?.focus();
      inputRefs.current[length - 1]?.select();
    } else {
      // Otherwise fill slots starting from currently active index
      let lastIndex = index;
      for (let i = 0; i < sanitized.length && index + i < length; i++) {
        nextDigits[index + i] = sanitized[i];
        lastIndex = index + i;
      }
      updateDigits(nextDigits);
      const target = Math.min(length - 1, lastIndex + 1);
      inputRefs.current[target]?.focus();
      inputRefs.current[target]?.select();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).select();
  };

  return (
    <div className={`${styles.container} ${shouldShake ? styles['container--shake'] : ''} ${className}`} id={id}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          value={digit}
          disabled={disabled}
          className={`${styles['digit-input']} ${digit ? styles['digit-input--filled'] : ''} ${error ? styles['digit-input--error'] : ''}`}
          aria-label={`Verification code digit ${i + 1} of ${length}`}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onChange={(e) => handleChange(e, i)}
          onPaste={(e) => handlePaste(e, i)}
          onFocus={handleFocus}
          onClick={handleClick}
        />
      ))}
    </div>
  );
}
