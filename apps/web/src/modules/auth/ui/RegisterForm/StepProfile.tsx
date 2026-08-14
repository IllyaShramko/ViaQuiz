import type { UseFormRegister } from 'react-hook-form';
import { useLocale } from '../../../../shared/i18n/useLocale';
import type { RegisterFormInputs } from '../../models';

export interface StepProfileProps {
  register: UseFormRegister<RegisterFormInputs>;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
  isVisible: boolean;
}

export function StepProfile({
  register,
  onNext,
  onBack,
  onSkip,
  isLoading,
  isVisible,
}: StepProfileProps) {
  const { t } = useLocale();

  return (
    <div
      style={{
        display: isVisible ? 'flex' : 'none',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div className="input-group">
        <label className="input-label" htmlFor="firstName">
          {t('register.first_name_label')} ({t('register.optional')})
        </label>
        <input
          id="firstName"
          type="text"
          className="input-field"
          placeholder={t('register.first_name_placeholder')}
          {...register('firstName')}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="lastName">
          {t('register.last_name_label')} ({t('register.optional')})
        </label>
        <input
          id="lastName"
          type="text"
          className="input-field"
          placeholder={t('register.last_name_placeholder')}
          {...register('lastName')}
        />
      </div>

      <div className="button-group">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onBack}
          disabled={isLoading}
        >
          {t('register.back')}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onNext}
          disabled={isLoading}
        >
          {isLoading ? t('register.sending_code') : t('register.next')}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onSkip}
          disabled={isLoading}
          style={{ height: 'auto', padding: '8px 16px' }}
        >
          {t('register.skip')}
        </button>
      </div>
    </div>
  );
}
