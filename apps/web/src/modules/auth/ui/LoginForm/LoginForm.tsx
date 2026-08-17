import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLocale } from '../../../../shared/i18n/useLocale';
import { useLoginMutation } from '../../api/authApi';
import { useUserContext } from '../../context';
import type { LoginFormInputs } from '../../models';
import { PasswordInput } from './PasswordInput';

export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const { login: setAuthContext } = useUserContext();
  const [serverError, setServerError] = useState<string | null>(null);

  const [loginApi] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setServerError(null);
      const response = await loginApi(data).unwrap();
      setAuthContext(response.token, response.user);
      if (onSuccess) {
        onSuccess();
      } else {
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const message =
        err.data?.error?.message ||
        err.data?.message ||
        err.message ||
        t('login.error_default');
      setServerError(message);
      if (onError) onError(message);
    }
  };

  return (
    <>
      {serverError && <div className="auth-error">{serverError}</div>}

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="input-group">
          <label className="input-label" htmlFor="email">
            {t('login.email_label')}
          </label>
          <input
            id="email"
            type="text"
            className={`input-field ${errors.email ? 'input--error' : ''}`}
            placeholder={t('login.email_placeholder')}
            {...register('email', {
              required: t('login.error_email_required'),
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: t('login.error_email_invalid'),
              },
            })}
          />
          {errors.email && (
            <span className="input-error">{errors.email.message}</span>
          )}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="password">
            {t('login.password_label')}
          </label>
          <PasswordInput
            id="password"
            placeholder={t('login.password_placeholder')}
            registration={register('password', {
              required: t('login.error_password_required'),
            })}
            error={errors.password?.message}
            showPasswordLabel={t('login.show_password')}
            hidePasswordLabel={t('login.hide_password')}
          />
          {errors.password && (
            <span className="input-error">{errors.password.message}</span>
          )}
        </div>

        <Link to="#" className="forgot-password disabled" onClick={(e) => e.preventDefault()}>
          {t('login.forgot_password')}
        </Link>

        <button
          type="submit"
          className="btn btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
    </>
  );
}
