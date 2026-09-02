import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { LoginFormProps, AuthRole } from './LoginForm.types';
import { useLocale } from '../../../../shared/i18n/useLocale';
import { useLoginMutation } from '../../api/authApi';
import { useStudentLoginMutation } from '../../../students/api/studentsApi';
import { useUserContext } from '../../context';
import { getSafeRedirectUrl } from '../../utils';
import { PasswordInput } from '../PasswordInput';
import styles from '../Auth.module.css';

export function LoginForm({ onSuccess, onError, defaultRole }: LoginFormProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: setAuthContext } = useUserContext();

  const roleParam = searchParams.get('role') || searchParams.get('tab') || searchParams.get('type');
  const redirectParam = searchParams.get('redirect') || searchParams.get('from') || '';
  const shouldDefaultToStudent =
    defaultRole === 'student' ||
    roleParam === 'student' ||
    (!roleParam && !defaultRole && (redirectParam.startsWith('/join') || redirectParam.startsWith('/student')));

  const [authRole, setAuthRole] = useState<AuthRole>(() => {
    if (roleParam === 'teacher') return 'teacher';
    if (shouldDefaultToStudent) return 'student';
    return defaultRole || 'teacher';
  });

  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (roleParam === 'student' || roleParam === 'teacher') {
      setAuthRole(roleParam);
    }
  }, [roleParam]);

  const [loginTeacher, { isLoading: isTeacherLoading }] = useLoginMutation();
  const [loginStudent, { isLoading: isStudentLoading }] = useStudentLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  const [studentLoginValue, setStudentLoginValue] = useState('');
  const [studentPasswordValue, setStudentPasswordValue] = useState('');
  const [studentError, setStudentError] = useState<string | null>(null);

  const onSubmitTeacher = async (data: { email: string; password: string }) => {
    try {
      setServerError(null);
      const response = await loginTeacher(data).unwrap();
      setAuthContext(response.token, { ...response.user, role: 'TEACHER' } as any);
      if (onSuccess) {
        onSuccess();
      } else {
        const targetUrl = getSafeRedirectUrl(searchParams, '/dashboard');
        navigate(targetUrl, { replace: true });
      }
    } catch (err: any) {
      let rawMessage =
        err.data?.error?.message ||
        err.data?.message ||
        err.message;

      let message = t('login.error_default');
      if (rawMessage) {
        const lower = String(rawMessage).toLowerCase();
        if (lower.includes('invalid email or password') || lower.includes('invalid credentials')) {
          message = 'Невірний email або пароль';
        } else if (lower.includes('not found')) {
          message = 'Користувача з такими даними не знайдено';
        } else if (lower.includes('invalid email format') || lower.includes('invalid email')) {
          message = 'Невірний формат email';
        } else {
          message = rawMessage;
        }
      }

      setServerError(message);
      if (onError) onError(message);
    }
  };

  const onSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentLoginValue.trim() || !studentPasswordValue.trim()) {
      setStudentError('Введіть логін та пароль');
      return;
    }

    try {
      setStudentError(null);
      const response = await loginStudent({
        login: studentLoginValue.trim(),
        password: studentPasswordValue.trim(),
      }).unwrap();

      setAuthContext(response.token, {
        id: response.student.id,
        uuid: response.student.uuid,
        login: response.student.login,
        firstName: response.student.firstName,
        lastName: response.student.lastName,
        role: 'STUDENT',
        email: '',
        createdAt: '',
      } as any);

      if (onSuccess) {
        onSuccess();
      } else {
        const targetUrl = getSafeRedirectUrl(searchParams, '/student/dashboard');
        navigate(targetUrl, { replace: true });
      }
    } catch (err: any) {
      let rawMessage =
        err.data?.error?.message ||
        err.data?.message ||
        err.message;

      let message = 'Невірний логін або пароль';
      if (rawMessage) {
        const lower = String(rawMessage).toLowerCase();
        if (lower.includes('not found') || lower.includes('invalid')) {
          message = 'Невірний логін або пароль';
        } else {
          message = rawMessage;
        }
      }

      setStudentError(message);
      if (onError) onError(message);
    }
  };

  return (
    <>
      {/* Role Switcher Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: 'var(--bg-surface, #1a1a26)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid var(--border, #2a2a3a)',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setAuthRole('teacher');
            setServerError(null);
          }}
          style={{
            background: authRole === 'teacher' ? 'var(--accent, #863bff)' : 'transparent',
            color: authRole === 'teacher' ? '#fff' : 'var(--text-secondary, #9090a8)',
            border: 'none',
            padding: '8px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Вчитель
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthRole('student');
            setStudentError(null);
          }}
          style={{
            background: authRole === 'student' ? 'var(--accent, #863bff)' : 'transparent',
            color: authRole === 'student' ? '#fff' : 'var(--text-secondary, #9090a8)',
            border: 'none',
            padding: '8px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Учень
        </button>
      </div>

      {authRole === 'teacher' ? (
        <>
          {serverError && <div className={styles['auth-error']}>{serverError}</div>}

          <form className={styles['auth-form']} onSubmit={handleSubmit(onSubmitTeacher)}>
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

            <Link to="#" className={`${styles['forgot-password']} ${styles['disabled']}`} onClick={(e) => e.preventDefault()}>
              {t('login.forgot_password')}
            </Link>

            <button
              type="submit"
              className={styles['auth-submit-btn']}
              disabled={isTeacherLoading}
            >
              {isTeacherLoading ? t('login.submitting') : t('login.submit')}
            </button>
          </form>
        </>
      ) : (
        <>
          {studentError && <div className={styles['auth-error']}>{studentError}</div>}

          <form className={styles['auth-form']} onSubmit={onSubmitStudent}>
            <div className="input-group">
              <label className="input-label" htmlFor="student-login-input">
                Логін учня
              </label>
              <input
                id="student-login-input"
                type="text"
                required
                className="input-field"
                placeholder="Введіть логін учня"
                value={studentLoginValue}
                onChange={(e) => setStudentLoginValue(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="student-password-input">
                Пароль
              </label>
              <input
                id="student-password-input"
                type="password"
                required
                className="input-field"
                placeholder="Пароль, наданий вчителем"
                value={studentPasswordValue}
                onChange={(e) => setStudentPasswordValue(e.target.value)}
              />
            </div>

            <span style={{ fontSize: '0.8rem', color: '#9090a8', marginTop: '-6px' }}>
              * Якщо ви забули пароль, зверніться до вашого вчителя для його оновлення
            </span>

            <button
              type="submit"
              className={styles['auth-submit-btn']}
              disabled={isStudentLoading || !studentLoginValue.trim() || !studentPasswordValue.trim()}
            >
              {isStudentLoading ? 'Вхід...' : 'Увійти як учень'}
            </button>
          </form>
        </>
      )}
    </>
  );
}
