import { useState } from 'react';
import { Button, Modal, WarningIcon } from '../../../../shared';
import { useLeaveCourseMutation } from '../../api/classesApi';
import type { LeaveCourseModalProps } from './LeaveCourseModal.types';
import styles from './LeaveCourseModal.module.css';

export function LeaveCourseModal({
  isOpen,
  onClose,
  onAfterClose,
  classUuid,
  courseUuid,
  courseName,
  onSuccess,
}: LeaveCourseModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [leaveCourse, { isLoading }] = useLeaveCourseMutation();

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
      const apiErr = err as { data?: { message?: string } };
      setErrorMessage(
        apiErr.data?.message || 'Не вдалося покинути курс. Спробуйте пізніше.',
      );
    }
  };

  const handleAfterClose = () => {
    setErrorMessage(null);
    onAfterClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={handleAfterClose}
      size="sm"
      title="Покинути курс"
      isBusy={isLoading}
      bodyClassName={styles.content}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={() => void handleConfirm()} disabled={isLoading}>
            {isLoading ? 'Обробка...' : 'Покинути курс'}
          </Button>
        </>
      }
    >
      <p className={styles.message}>
        Ви впевнені, що хочете припинити керівництво курсом{' '}
        <strong>«{courseName}»</strong>?
      </p>

      <div className={styles.warningBox}>
        <WarningIcon size={16} className={styles.warningIcon} aria-hidden="true" />
        <span>
          Керівництво курсом автоматично повернеться до куратора класу. Усі створені сесії
          та результати учнів залишаться у курсі.
        </span>
      </div>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </Modal>
  );
}
