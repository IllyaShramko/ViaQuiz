import { useState, useEffect } from 'react';
import type { StepVerificationProps } from './StepVerification.types';
import { useLocale } from '../../../../../../shared/i18n/useLocale';
import { VerificationCodeInput } from '../../../VerificationCodeInput';
import styles from './StepVerification.module.css';

/**
 * Format server-side verification error messages to localized user-friendly text.
 */
function formatVerificationError(
  message: string,
  t: (key: string) => string
): string {
  if (message.includes('Invalid verification code')) {
    const match = message.match(/Remaining attempts:\s*(\d+)/i);
    if (match) {
      return t('register.error_code_attempts').replace('{attempts}', match[1]);
    }
    return t('register.error_code_invalid');
  }

  if (message.includes('Maximum verification attempts exceeded')) {
    return t('register.error_code_attempts_exceeded');
  }

  if (message.includes('Verification code has expired')) {
    return t('register.error_code_expired');
  }

  if (message.includes('Verification code not found')) {
    return t('register.error_code_not_found');
  }

  return message;
}

export function StepVerification({
  register,
  setValue,
  watch,
  errors,
  targetEmail,
  cooldown,
  onResend,
  onBack,
  onSubmitForm,
  verificationError,
  onClearError,
  isSubmitting,
  isVisible,
}: StepVerificationProps) {
  const { t } = useLocale();

  const formCode = watch('code') || '';
  const [localCode, setLocalCode] = useState(formCode);

  // Synchronize localCode whenever formCode changes externally (e.g., resend code or reset)
  useEffect(() => {
    if (formCode !== localCode) {
      setLocalCode(formCode);
    }
  }, [formCode]);

  const handleCodeChange = (newCode: string) => {
    // Clear any active server verification error when user edits the code
    if (verificationError && onClearError) {
      onClearError();
    }

    setLocalCode(newCode);
    setValue('code', newCode, {
      shouldValidate: newCode.length === 6 || !!errors.code,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleCodeComplete = (completedCode: string) => {
    if (!isSubmitting && completedCode.length === 6) {
      // Delay slightly to ensure React state and form values have settled
      setTimeout(() => {
        onSubmitForm?.();
      }, 50);
    }
  };

  const activeErrorMessage = verificationError
    ? formatVerificationError(verificationError, t)
    : errors.code?.message;
  const hasError = Boolean(verificationError || errors.code);

  return (
    <div
      className={styles['verification-step']}
      style={{
        display: isVisible ? 'flex' : 'none',
      }}
    >
      <div className={styles['verification-container']}>
        <p className={styles['info-text']}>
          {t('register.code_sent_to')} <strong>{targetEmail}</strong>
        </p>

        <div className={styles['code-input-wrapper']}>
          {/* Hidden input to maintain react-hook-form validation state and rules */}
          <input
            type="hidden"
            value={localCode}
            {...register('code', {
              required: t('register.error_code_required'),
              minLength: {
                value: 6,
                message: t('register.error_code_length'),
              },
              maxLength: {
                value: 6,
                message: t('register.error_code_length'),
              },
            })}
            onChange={() => {}}
          />

          <VerificationCodeInput
            value={localCode}
            onChange={handleCodeChange}
            onComplete={handleCodeComplete}
            length={6}
            error={hasError}
            disabled={isSubmitting}
            autoFocus={isVisible}
          />

          {hasError && activeErrorMessage && (
            <div className={styles['error-badge']}>
              <svg
                className={styles['error-icon']}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{activeErrorMessage}</span>
            </div>
          )}
        </div>

        <div className={styles['resend-container']}>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onResend}
            disabled={cooldown > 0 || isSubmitting}
          >
            {t('register.resend_code')}
          </button>
          {cooldown > 0 && (
            <span className={styles['resend-timer']}>
              {cooldown} {t('register.resend_cooldown')}
            </span>
          )}
        </div>
      </div>

      <div className={styles['button-group']}>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onBack}
          disabled={isSubmitting}
        >
          {t('register.back')}
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('register.registering') : t('register.submit')}
        </button>
      </div>
    </div>
  );
}
