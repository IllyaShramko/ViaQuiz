import { useEffect, useRef, useState } from 'react';
import { Button, CheckIcon, CopyIcon, Modal, copyToClipboard } from '../../../../shared';
import { useResetStudentPasswordMutation } from '../../api/classesApi';
import type { ResetPasswordModalProps } from './ResetPasswordModal.types';
import styles from './ResetPasswordModal.module.css';

export function ResetPasswordModal({
  classUuid,
  studentUuid,
  studentName,
  isOpen,
  onClose,
  onAfterClose,
}: ResetPasswordModalProps) {
  const [newCredentials, setNewCredentials] = useState<{
    login: string;
    newPassword: string;
    studentName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const copyTimerRef = useRef<number | null>(null);

  const [resetPassword, { isLoading, error, reset: resetMutation }] =
    useResetStudentPasswordMutation();

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleReset = async () => {
    try {
      const res = await resetPassword({ classUuid, studentUuid }).unwrap();
      setNewCredentials(res);
    } catch {
      // Handled by RTK Query error state
    }
  };

  const handleCopy = async () => {
    if (!newCredentials) return;
    const text = `Новий пароль для учня ${newCredentials.studentName}:\nЛогін: ${newCredentials.login}\nНовий пароль: ${newCredentials.newPassword}`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2500);
    }
  };

  const handleAfterClose = () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    setNewCredentials(null);
    setCopied(false);
    resetMutation();
    onAfterClose?.();
  };

  const errorMessage =
    error &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data
      ? String(error.data.message)
      : error
        ? 'Не вдалося скинути пароль'
        : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={handleAfterClose}
      size="sm"
      title="Скидання пароля учня"
      isBusy={isLoading}
      bodyClassName={styles.body}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {newCredentials ? 'Закрити' : 'Скасувати'}
          </Button>
          {!newCredentials && (
            <Button
              variant="primary"
              onClick={() => void handleReset()}
              disabled={isLoading}
            >
              {isLoading ? 'Генерація...' : 'Згенерувати новий пароль'}
            </Button>
          )}
        </>
      }
    >
      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          {errorMessage}
        </div>
      )}

      {newCredentials ? (
        <div className={styles.successBox}>
          <h4 className={styles.successTitle}>
            <CheckIcon size={18} aria-hidden="true" />
            Пароль успішно оновлено!
          </h4>

          <div className={styles.credentialsCard}>
            <div className={styles.credentialItem}>
              <span className={styles.credentialLabel}>Учень:</span>
              <span className={styles.credentialVal}>{newCredentials.studentName}</span>
            </div>
            <div className={styles.credentialItem}>
              <span className={styles.credentialLabel}>Логін:</span>
              <span className={styles.credentialVal}>{newCredentials.login}</span>
            </div>
            <div className={styles.credentialItem}>
              <span className={styles.credentialLabel}>Новий пароль:</span>
              <span className={`${styles.credentialVal} ${styles.passwordVal}`}>
                {newCredentials.newPassword}
              </span>
            </div>
          </div>

          <Button variant="secondary" fullWidth onClick={() => void handleCopy()}>
            {copied ? (
              <CheckIcon size={16} aria-hidden="true" />
            ) : (
              <CopyIcon size={16} aria-hidden="true" />
            )}
            {copied ? 'Скопійовано в буфер!' : 'Скопіювати новий пароль'}
          </Button>
        </div>
      ) : (
        <div className={styles.promptBlock}>
          <p className={styles.promptTitle}>
            Ви впевнені, що хочете згенерувати новий пароль для учня{' '}
            <strong>{studentName}</strong>?
          </p>
          <p className={styles.promptHint}>
            Попередній пароль перестане діяти, і вам буде надано новий код доступу для
            передачі учневі.
          </p>
        </div>
      )}
    </Modal>
  );
}
