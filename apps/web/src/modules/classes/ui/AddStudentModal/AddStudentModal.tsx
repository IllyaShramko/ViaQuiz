import { useState, useEffect, type FormEvent } from 'react';
import { useAddStudentMutation } from '../../api/classesApi';
import { generateStudentLogin, generateSimplePassword } from '../../../../shared/tools/translit';
import styles from './AddStudentModal.module.css';

interface AddStudentModalProps {
  classUuid: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddStudentModal({
  classUuid,
  isOpen,
  onClose,
}: AddStudentModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState(() => generateSimplePassword(8));
  const [isCustomLogin, setIsCustomLogin] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    login: string;
    password: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [addStudent, { isLoading, error }] = useAddStudentMutation();

  // Auto-generate login based on first & last name unless customized by teacher
  useEffect(() => {
    if (!isCustomLogin && (firstName || lastName)) {
      const generated = generateStudentLogin(firstName, lastName);
      setLogin(generated);
    }
  }, [firstName, lastName, isCustomLogin]);

  if (!isOpen) return null;

  const handleRegeneratePassword = () => {
    setPassword(generateSimplePassword(8));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    try {
      const res = await addStudent({
        classUuid,
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          login: login.trim() || undefined,
          password: password.trim() || undefined,
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
    setFirstName('');
    setLastName('');
    setLogin('');
    setPassword(generateSimplePassword(8));
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
                  setFirstName('');
                  setLastName('');
                  setLogin('');
                  setPassword(generateSimplePassword(8));
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
          <form onSubmit={handleSubmit}>
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
                    required
                    placeholder="Введіть прізвище"
                    className={styles['form-input']}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>

                <div className={styles['form-group']}>
                  <label className={styles['form-label']} htmlFor="student-firstName">
                    Ім'я *
                  </label>
                  <input
                    id="student-firstName"
                    type="text"
                    required
                    placeholder="Введіть ім'я"
                    className={styles['form-input']}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
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
                    className={styles['form-input']}
                    value={login}
                    onChange={(e) => {
                      setLogin(e.target.value);
                      setIsCustomLogin(true);
                    }}
                  />
                </div>
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
                    className={styles['form-input']}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                disabled={isLoading || !firstName.trim() || !lastName.trim()}
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
};
