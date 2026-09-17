import { useState } from 'react';
import { useLeaveCourseMutation } from '../../api/classesApi';
import { WarningIcon } from '../../../../shared';
import type { LeaveCourseModalProps } from './LeaveCourseModal.types';
import styles from './LeaveCourseModal.module.css';

export function LeaveCourseModal({
  isOpen,
  onClose,
  classUuid,
  courseUuid,
  courseName,
  onSuccess,
}: LeaveCourseModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [leaveCourse, { isLoading }] = useLeaveCourseMutation();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      await leaveCourse({
        classUuid,
        courseUuid,
      }).unwrap();

      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setErrorMessage(
        e.data?.message || 'Не вдалося покинути курс. Спробуйте пізніше.',
      );
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Покинути курс</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>
            Ви впевнені, що хочете припинити керівництво курсом <strong>«{courseName}»</strong>?
          </p>

          <div className={styles.warningBox}>
            <WarningIcon size={18} />
            <span>
              Керівництво курсом автоматично повернеться до куратора класу. Усі створені сесії та результати учнів залишаться у курсі.
            </span>
          </div>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isLoading}
            >
              Скасувати
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Обробка...' : 'Покинути курс'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
