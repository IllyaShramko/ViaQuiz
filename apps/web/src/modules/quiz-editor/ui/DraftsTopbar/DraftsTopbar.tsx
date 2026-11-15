import { ArrowIcon } from '../../../../shared';
import type { DraftsTopbarProps } from './DraftsTopbar.types';
import styles from './DraftsTopbar.module.css';

export function DraftsTopbar({
  draftsCount,
  maxDrafts,
  onBack,
  title = 'Конструктор вікторин',
  backText = 'До панелі вчителя',
}: DraftsTopbarProps) {
  const isFull = draftsCount >= maxDrafts;

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          <ArrowIcon width={15} height={15} />
          <span>{backText}</span>
        </button>
      </div>

      <div className={styles.center}>
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div className={styles.right}>
        <div
          className={`${styles.counterPill} ${isFull ? styles.isFull : ''}`}
          aria-label={`Чернетки: ${draftsCount} з ${maxDrafts}`}
        >
          <span className={styles.slotTrack} aria-hidden="true">
            {Array.from({ length: maxDrafts }, (_, idx) => (
              <span
                key={idx}
                className={`${styles.slotPip} ${idx < draftsCount ? styles.slotPipFilled : ''}`}
              />
            ))}
          </span>
          <span>
            Чернетки: <strong>{draftsCount}</strong> / {maxDrafts}
          </span>
        </div>
      </div>
    </header>
  );
}
