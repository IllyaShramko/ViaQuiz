import { LogoIcon, PlusIcon, WarningIcon } from '../../../../shared';
import { DraftCard } from '../DraftCard';
import type { DraftsGridProps } from './DraftsGrid.types';
import styles from './DraftsGrid.module.css';

export function DraftsGrid({
  drafts,
  isLoading = false,
  isError = false,
  isCreating = false,
  canCreateMore,
  deletingId = null,
  isDeleting = false,
  publishingId = null,
  sortBy = 'updatedAt',
  maxDrafts = 3,
  onRetry,
  onCreateNew,
  onOpenDraft,
  onDeleteDraft,
  onPublishDraft,
}: DraftsGridProps) {
  if (isLoading) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Завантаження чернеток">
        {Array.from({ length: maxDrafts }, (_, idx) => (
          <div key={idx} className={styles.skeletonCard}>
            <div className={styles.skeletonCover} />
            <div className={styles.skeletonBody}>
              <div className={styles.skeletonLine} />
              <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
              <div className={styles.skeletonFooter} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorCard}>
        <h3 className={styles.errorTitle}>Не вдалося завантажити чернетки</h3>
        <p className={styles.errorText}>
          Перевірте з&apos;єднання з інтернетом та спробуйте ще раз.
        </p>
        {onRetry && (
          <button type="button" className={styles.retryBtn} onClick={onRetry}>
            Спробувати знову
          </button>
        )}
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <div className={styles.emptyIconChip} aria-hidden="true">
          <LogoIcon size={22} />
        </div>
        <h3 className={styles.emptyTitle}>Чернеток поки немає</h3>
        <p className={styles.emptyText}>
          Створіть новий квіз з чистого аркуша — у конструкторі можна зберігати до {maxDrafts} чернеток одночасно.
        </p>
        <button
          type="button"
          className={styles.emptyActionBtn}
          onClick={onCreateNew}
          disabled={isCreating}
        >
          <PlusIcon size={16} />
          <span>{isCreating ? 'Створення...' : 'Створити новий квіз'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {!canCreateMore && (
        <div className={styles.limitBanner} role="status">
          <span className={styles.limitBannerIcon} aria-hidden="true">
            <WarningIcon size={16} />
          </span>
          <span>
            <strong>Ліміт чернеток ({drafts.length} / {maxDrafts}):</strong> опублікуйте або видаліть одну з них, щоб створити нову вікторину.
          </span>
        </div>
      )}

      <div className={styles.grid}>
        {drafts.map((draft, idx) => (
          <DraftCard
            key={draft.id}
            draft={draft}
            index={idx}
            isDeleting={isDeleting && deletingId === draft.id}
            isPublishing={publishingId === draft.id}
            sortBy={sortBy}
            onOpen={onOpenDraft}
            onDelete={onDeleteDraft}
            onPublish={onPublishDraft}
          />
        ))}
      </div>
    </div>
  );
}
