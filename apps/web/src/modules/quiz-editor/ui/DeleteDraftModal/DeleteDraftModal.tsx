import { useEffect } from 'react';
import { CloseIcon, WarningIcon, pluralizeQuestions } from '../../../../shared';
import type { DeleteDraftModalProps } from './DeleteDraftModal.types';
import styles from './DeleteDraftModal.module.css';

export function DeleteDraftModal({
  draft,
  isDeleting = false,
  errorMessage = null,
  onClose,
  onConfirm,
}: DeleteDraftModalProps) {
  useEffect(() => {
    if (!draft) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draft, isDeleting, onClose]);

  if (!draft) return null;

  const displayName = draft.name?.trim() || 'Новий квіз';
  const questionsCount = draft._count?.questions ?? draft.questions?.length ?? 0;

  return (
    <div
      className={styles.backdrop}
      onClick={() => {
        if (!isDeleting) onClose();
      }}
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-draft-modal-title"
      >
        <div className={styles.header}>
          <h2 id="delete-draft-modal-title" className={styles.title}>
            Видалити чернетку
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Закрити"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>
            Ви впевнені, що хочете видалити чернетку <strong>«{displayName}»</strong>? Цю дію неможливо скасувати.
          </p>

          {questionsCount > 0 && (
            <div className={styles.warningBox}>
              <WarningIcon size={16} />
              <span>
                У чернетці вже збережено {pluralizeQuestions(questionsCount, true)} — вони будуть видалені безповоротно.
              </span>
            </div>
          )}

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={isDeleting}
            >
              Скасувати
            </button>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={() => onConfirm(draft)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Видалення...' : 'Видалити чернетку'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
