import { Button, Modal, WarningIcon, pluralizeQuestions } from '../../../../shared';
import type { DeleteDraftModalProps } from './DeleteDraftModal.types';
import styles from './DeleteDraftModal.module.css';

export function DeleteDraftModal({
  draft,
  isOpen,
  isDeleting = false,
  errorMessage = null,
  onClose,
  onAfterClose,
  onConfirm,
}: DeleteDraftModalProps) {
  const modalOpen = isOpen ?? Boolean(draft);
  const displayName = draft?.name?.trim() || 'Новий квіз';
  const questionsCount = draft?._count?.questions ?? draft?.questions?.length ?? 0;

  return (
    <Modal
      isOpen={modalOpen}
      onClose={onClose}
      onAfterClose={onAfterClose}
      isBusy={isDeleting}
      size="sm"
      title="Видалити чернетку"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Скасувати
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (draft) onConfirm(draft);
            }}
            disabled={isDeleting || !draft}
          >
            {isDeleting ? 'Видалення...' : 'Видалити чернетку'}
          </Button>
        </>
      }
    >
      {draft && (
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
        </div>
      )}
    </Modal>
  );
}
