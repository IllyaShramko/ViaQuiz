import { useState } from 'react';
import { useResetStudentPasswordMutation } from '../../api/classesApi';
import type { ResetPasswordModalProps } from './ResetPasswordModal.types';
import styles from '../AddStudentModal/AddStudentModal.module.css';

export function ResetPasswordModal({
  classUuid,
  studentUuid,
  studentName,
  isOpen,
  onClose,
}: ResetPasswordModalProps) {
  const [newCredentials, setNewCredentials] = useState<{
    login: string;
    newPassword: string;
    studentName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [resetPassword, { isLoading, error }] = useResetStudentPasswordMutation();

  if (!isOpen) return null;

  const handleReset = async () => {
    try {
      const res = await resetPassword({ classUuid, studentUuid }).unwrap();
      setNewCredentials(res);
    } catch {
      // Handled by RTK Query error
    }
  };

  const handleCopy = () => {
    if (!newCredentials) return;
    const text = `Новий пароль для учня ${newCredentials.studentName}:\nЛогін: ${newCredentials.login}\nНовий пароль: ${newCredentials.newPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClose = () => {
    setNewCredentials(null);
    setCopied(false);
    onClose();
  };

  const errorMessage =
    error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : error
      ? 'Не вдалося скинути пароль'
      : null;

  return (
    <div className={styles['modal-backdrop']} onClick={handleClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>Скидання пароля учня</h2>
          <button
            type="button"
            className={styles['modal-close-btn']}
            onClick={handleClose}
            aria-label="Закрити"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles['modal-body']}>
          {errorMessage && <div className={styles['error-banner']}>{errorMessage}</div>}

          {newCredentials ? (
            <div className={styles['success-box']}>
              <h4 className={styles['success-title']}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Пароль успішно оновлено!
              </h4>

              <div className={styles['credentials-card']}>
                <div className={styles['credential-item']}>
                  <span className={styles['credential-label']}>Учень:</span>
                  <span className={styles['credential-val']}>{newCredentials.studentName}</span>
                </div>
                <div className={styles['credential-item']}>
                  <span className={styles['credential-label']}>Логін:</span>
                  <span className={styles['credential-val']}>{newCredentials.login}</span>
                </div>
                <div className={styles['credential-item']}>
                  <span className={styles['credential-label']}>Новий пароль:</span>
                  <span className={styles['credential-val']} style={{ color: '#22c55e' }}>
                    {newCredentials.newPassword}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={styles['copy-all-btn']}
                onClick={handleCopy}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                {copied ? 'Скопійовано в буфер!' : 'Скопіювати новий пароль'}
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: '#f0f0f5', margin: '0 0 12px 0', fontSize: '0.95rem' }}>
                Ви впевнені, що хочете згенерувати новий пароль для учня <strong>{studentName}</strong>?
              </p>
              <p style={{ color: '#9090a8', margin: 0, fontSize: '0.85rem' }}>
                Попередній пароль перестане діяти, і вам буде надано новий код доступу для передачі учневі.
              </p>
            </div>
          )}
        </div>

        <div className={styles['modal-footer']}>
          <button type="button" className={styles['btn-secondary']} onClick={handleClose}>
            {newCredentials ? 'Закрити' : 'Скасувати'}
          </button>
          {!newCredentials && (
            <button
              type="button"
              className={styles['btn-primary']}
              onClick={handleReset}
              disabled={isLoading}
            >
              {isLoading ? 'Генерація...' : 'Згенерувати новий пароль'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
