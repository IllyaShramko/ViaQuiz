import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useLocale } from '../../shared/i18n/useLocale';
import { apiLogin, setToken } from '../../shared/api/client';
import './LoginPage.css';

interface LoginFormInputs {
  email: string;
  password: string;
}

export function LoginPage() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setServerError(null);
      const response = await apiLogin(data);
      setToken(response.token);
      navigate('/');
    } catch (err: any) {
      setServerError(err.message || t('login.error_default'));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <svg viewBox="0 0 48 46">
            <path
              fill="currentColor"
              d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
            />
          </svg>
          ViaQuiz
        </Link>
        <h1 className="auth-title">{t('login.title')}</h1>
        <p className="auth-subtitle">{t('login.subtitle')}</p>

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
            <div className="password-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`input-field ${errors.password ? 'input--error' : ''}`}
                placeholder={t('login.password_placeholder')}
                {...register('password', {
                  required: t('login.error_password_required'),
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('login.hide_password') : t('login.show_password')}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
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

        <div className="auth-footer">
          {t('login.no_account')} <Link to="/register">{t('login.sign_up_link')}</Link>
        </div>
      </div>
    </div>
  );
}
