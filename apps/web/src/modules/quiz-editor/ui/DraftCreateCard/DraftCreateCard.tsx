import { PlusIcon, WarningIcon, pluralizeUk } from '../../../../shared';
import type { DraftCreateCardProps } from './DraftCreateCard.types';
import styles from './DraftCreateCard.module.css';

export function DraftCreateCard({
  canCreateMore,
  isCreating,
  maxDrafts = 3,
  remainingSlots,
  onCreate,
}: DraftCreateCardProps) {
  if (!canCreateMore) {
    return (
      <div className={styles.limitCard}>
        <div className={styles.inner}>
          <span className={styles.limitIcon}>
            <WarningIcon size={22} />
          </span>
          <span className={styles.limitTitle}>Ліміт вичерпано</span>
          <span className={styles.limitDesc}>
            У вас уже створено {maxDrafts} чернетки. Опублікуйте або видаліть одну з них для створення нової.
          </span>
        </div>
      </div>
    );
  }

  const slotHint =
    typeof remainingSlots === 'number' && remainingSlots < maxDrafts
      ? `Доступно ще ${remainingSlots} ${pluralizeUk(remainingSlots, ['слот', 'слоти', 'слотів'])}`
      : 'Почати з чистого аркуша';

  return (
    <button
      type="button"
      className={styles.card}
      onClick={onCreate}
      disabled={isCreating}
    >
      <div className={styles.inner}>
        {isCreating ? (
          <>
            <div className={styles.spinner} />
            <span className={styles.mainText}>Створення квізу...</span>
          </>
        ) : (
          <>
            <div className={styles.iconChip}>
              <PlusIcon width={20} height={20} />
            </div>
            <span className={styles.mainText}>Створити новий квіз</span>
            <span className={styles.subText}>{slotHint}</span>
          </>
        )}
      </div>
    </button>
  );
}
