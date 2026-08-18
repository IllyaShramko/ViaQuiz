import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { useLocale } from '../../../../shared/i18n/useLocale';
import type { RegisterFormInputs } from '../../models';
import styles from '../Auth.module.css';

export interface StepVerificationProps {
  register: UseFormRegister<RegisterFormInputs>;
  errors: FieldErrors<RegisterFormInputs>;
  targetEmail: string;
  cooldown: number;
  onResend: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  isVisible: boolean;
}

export function StepVerification({
  register,
  errors,
  targetEmail,
  cooldown,
  onResend,
  onBack,
  isSubmitting,
  isVisible,
}: StepVerificationProps) {
  const { t } = useLocale();

  return (
    <div
      style={{
        display: isVisible ? 'flex' : 'none',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div className={styles['verification-container']}>
        <p>
          {t('register.code_sent_to')} {targetEmail}
        </p>

        <div className="input-group" style={{ width: '100%', alignItems: 'center' }}>
          <input
            type="text"
            className={`input-field ${styles['verification-input']} ${errors.code ? 'input--error' : ''}`}
            placeholder="000000"
            maxLength={6}
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
          />
          {errors.code && (
            <span className="input-error">{errors.code.message}</span>
          )}
        </div>

        <div className={styles['resend-container']}>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onResend}
            disabled={cooldown > 0}
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
