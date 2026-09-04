import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddStudentMutation } from '../../api/classesApi';
import { generateStudentLogin, generateSimplePassword } from '../../../../shared/tools/translit';
import {
  addStudentSchema,
  type AddStudentFormData,
  type AddStudentModalProps,
} from './AddStudentModal.types';
import styles from './AddStudentModal.module.css';

export function AddStudentModal({
  classUuid,
  isOpen,
  onClose,
}: AddStudentModalProps) {
  const [isCustomLogin, setIsCustomLogin] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    login: string;
    password: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [addStudent, { isLoading, error }] = useAddStudentMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      login: '',
      password: generateSimplePassword(8),
    },
  });

  const firstName = watch('firstName');
  const lastName = watch('lastName');

  // Auto-generate login based on first & last name unless customized by teacher
  useEffect(() => {
    if (!isCustomLogin && (firstName || lastName)) {
      const generated = generateStudentLogin(firstName || '', lastName || '');
      setValue('login', generated, { shouldValidate: true });
    }
  }, [firstName, lastName, isCustomLogin, setValue]);

  if (!isOpen) return null;

  const handleRegeneratePassword = () => {
    setValue('password', generateSimplePassword(8), { shouldValidate: true });
  };

  const onSubmit = async (data: AddStudentFormData) => {
    try {
      const res = await addStudent({
        classUuid,
        body: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          login: data.login?.trim() || undefined,
          password: data.password?.trim() || undefined,
        },
      }).unwrap();

      setCreatedCredentials(res.credentials);
    } catch {
      // Error handled by RTK Query error state
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Дані для входу до ViaQuiz:\nІм'я: ${createdCredentials.firstName} ${createdCredentials.lastName}\nЛогін: ${createdCredentials.login}\nПароль: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleResetAndClose = () => {
    reset({
      firstName: '',
      lastName: '',
      login: '',
      password: generateSimplePassword(8),
    });
    setIsCustomLogin(false);
    setCreatedCredentials(null);
    setCopied(false);
    onClose();
  };

  const errorMessage =
    error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : error
      ? 'Не вдалося додати учня'
      : null;

  return (
    <div className={styles['modal-backdrop']} onClick={handleResetAndClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>
            {createdCredentials ? 'Учня успішно додано' : 'Додати нового учня'}
          </h2>
          <button
            type="button"
            className={styles['modal-close-btn']}
            onClick={handleResetAndClose}
            aria-label="Закрити"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {createdCredentials ? (
          <>
            <div className={styles['modal-body']}>
              <div className={styles['success-box']}>
                <h4 className={styles['success-title']}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Обліковий запис створено!
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#9090a8' }}>
                  Передайте ці облікові дані учню для входу в систему:
                </p>

                <div className={styles['credentials-card']}>
                  <div className={styles['credential-item']}>
                    <span className={styles['credential-label']}>Учень:</span>
                    <span className={styles['credential-val']}>
                      {createdCredentials.firstName} {createdCredentials.lastName}
                    </span>
                  </div>
                  <div className={styles['credential-item']}>
                    <span className={styles['credential-label']}>Логін:</span>
                    <span className={styles['credential-val']}>{createdCredentials.login}</span>
                  </div>
                  <div className={styles['credential-item']}>
                    <span className={styles['credential-label']}>Пароль:</span>
                    <span className={styles['credential-val']}>{createdCredentials.password}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles['copy-all-btn']}
                  onClick={handleCopyCredentials}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  {copied ? 'Скопійовано в буфер!' : 'Скопіювати дані для входу'}
                </button>
              </div>
            </div>

            <div className={styles['modal-footer']}>
              <button
                type="button"
                className={styles['btn-secondary']}
                onClick={() => {
                  setCreatedCredentials(null);
                  setCreatedCredentials(null);
                  reset({
                    firstName: '',
                    lastName: '',
                    login: '',
                    password: generateSimplePassword(8),
                  });
                  setIsCustomLogin(false);
                }}
              >
                + Додати ще одного
              </button>
              <button
                type="button"
                className={styles['btn-primary']}
                onClick={handleResetAndClose}
              >
                Готово
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles['modal-body']}>
              {errorMessage && <div className={styles['error-banner']}>{errorMessage}</div>}

              <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                  <label className={styles['form-label']} htmlFor="student-lastName">
                    Прізвище *
                  </label>
                  <input
                    id="student-lastName"
                    type="text"
                    placeholder="Введіть прізвище"
                    className={`${styles['form-input']} ${errors.lastName ? styles['input--error'] : ''}`}
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                      {errors.lastName.message}
                    </span>
                  )}
                </div>

                <div className={styles['form-group']}>
                  <label className={styles['form-label']} htmlFor="student-firstName">
                    Ім'я *
                  </label>
                  <input
                    id="student-firstName"
                    type="text"
                    placeholder="Введіть ім'я"
                    className={`${styles['form-input']} ${errors.firstName ? styles['input--error'] : ''}`}
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                      {errors.firstName.message}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles['form-group']}>
                <label className={styles['form-label']} htmlFor="student-login">
                  Логін (автоматично транслітерується)
                </label>
                <div className={styles['input-wrapper']}>
                  <input
                    id="student-login"
                    type="text"
                    placeholder="Генерується автоматично"
                    className={`${styles['form-input']} ${errors.login ? styles['input--error'] : ''}`}
                    {...register('login', {
                      onChange: () => setIsCustomLogin(true),
                    })}
                  />
                </div>
                {errors.login && (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                    {errors.login.message}
                  </span>
                )}
                <span className={styles['hint-text']}>
                  Можна змінити вручну або залишити автоматичний
                </span>
              </div>

              <div className={styles['form-group']}>
                <label className={styles['form-label']} htmlFor="student-password">
                  Пароль (авто-генерація)
                </label>
                <div className={styles['input-wrapper']}>
                  <input
                    id="student-password"
                    type="text"
                    className={`${styles['form-input']} ${errors.password ? styles['input--error'] : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className={styles['input-action-btn']}
                    onClick={handleRegeneratePassword}
                    title="Згенерувати інший пароль"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  </button>
                </div>
                {errors.password && (
                  <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                    {errors.password.message}
                  </span>
                )}
                <span className={styles['hint-text']}>
                  Простий надійний код для швидкого входу учня
                </span>
              </div>
            </div>

            <div className={styles['modal-footer']}>
              <button
                type="button"
                className={styles['btn-secondary']}
                onClick={handleResetAndClose}
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={isLoading || !firstName?.trim() || !lastName?.trim()}
                className={styles['btn-primary']}
              >
                {isLoading ? 'Створення...' : 'Створити учня'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
