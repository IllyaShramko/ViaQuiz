import type { FieldErrors, UseFormGetValues, UseFormRegister } from 'react-hook-form';
import { useLocale } from '../../../../shared/i18n/useLocale';
import type { RegisterFormInputs } from '../../models';
import { PasswordInput } from '../LoginForm/PasswordInput';
import styles from '../Auth.module.css';

export interface StepCredentialsProps {
  register: UseFormRegister<RegisterFormInputs>;
  errors: FieldErrors<RegisterFormInputs>;
  getValues: UseFormGetValues<RegisterFormInputs>;
  onNext: () => void;
  isLoading: boolean;
  isVisible: boolean;
}

export function StepCredentials({
  register,
  errors,
  getValues,
  onNext,
  isLoading,
  isVisible,
}: StepCredentialsProps) {
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
        <label className="input-label" htmlFor="login">
          {t('register.login_label')}
        </label>
        <input
          id="login"
          type="text"
          className={`input-field ${errors.login ? 'input--error' : ''}`}
          placeholder={t('register.login_placeholder')}
          {...register('login', {
            required: t('register.error_login_required'),
            minLength: {
              value: 3,
              message: t('register.error_login_min'),
            },
            maxLength: {
              value: 20,
              message: t('register.error_login_max'),
            },
            pattern: {
              value: /^[a-zA-Z0-9_-]+$/,
              message: t('register.error_login_pattern'),
            },
          })}
        />
        {errors.login && <span className="input-error">{errors.login.message}</span>}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="email">
          {t('register.email_label')}
        </label>
        <input
          id="email"
          type="email"
          className={`input-field ${errors.email ? 'input--error' : ''}`}
          placeholder={t('register.email_placeholder')}
          {...register('email', {
            required: t('register.error_email_required'),
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: t('register.error_email_invalid'),
            },
          })}
        />
        {errors.email && <span className="input-error">{errors.email.message}</span>}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="password">
          {t('register.password_label')}
        </label>
        <PasswordInput
          id="password"
          placeholder={t('register.password_placeholder')}
          registration={register('password', {
            required: t('register.error_password_required'),
            minLength: {
              value: 6,
              message: t('register.error_password_min'),
            },
            maxLength: {
              value: 64,
              message: t('register.error_password_max'),
            },
          })}
          error={errors.password?.message}
          showPasswordLabel={t('register.show_password')}
          hidePasswordLabel={t('register.hide_password')}
        />
        {errors.password && <span className="input-error">{errors.password.message}</span>}
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="confirmPassword">
          {t('register.confirm_password_label')}
        </label>
        <PasswordInput
          id="confirmPassword"
          placeholder={t('register.confirm_password_placeholder')}
          registration={register('confirmPassword', {
            required: t('register.error_confirm_password_required'),
            validate: (val) =>
              val === getValues('password') || t('register.error_passwords_match'),
          })}
          error={errors.confirmPassword?.message}
          showPasswordLabel={t('register.show_password')}
          hidePasswordLabel={t('register.hide_password')}
        />
        {errors.confirmPassword && (
          <span className="input-error">{errors.confirmPassword.message}</span>
        )}
      </div>

      <button
        type="button"
        className={styles['auth-submit-btn']}
        onClick={onNext}
        disabled={isLoading}
      >
        {isLoading ? t('register.checking') : t('register.next')}
      </button>
    </div>
  );
}
