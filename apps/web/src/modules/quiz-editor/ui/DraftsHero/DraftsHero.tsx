import type { DraftsHeroProps } from './DraftsHero.types';
import styles from './DraftsHero.module.css';

export function DraftsHero({
  title = 'Ваші чернетки вікторин',
  subtitle,
  draftsCount,
  maxDrafts = 3,
  rightSlot,
}: DraftsHeroProps) {
  const isFull = typeof draftsCount === 'number' && draftsCount >= maxDrafts;

  const defaultSubtitle = isFull
    ? `Усі ${maxDrafts} слоти зайняті — опублікуйте або видаліть чернетку, щоб створити нову.`
    : `Оберіть чернетку для продовження редагування або створіть нову (до ${maxDrafts} одночасно).`;

  return (
    <div className={styles.header}>
      <div className={styles.headingGroup}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{title}</h2>
          {typeof draftsCount === 'number' && (
            <span
              className={`${styles.capacityBadge} ${isFull ? styles.capacityBadgeFull : ''}`}
            >
              {draftsCount} / {maxDrafts}
            </span>
          )}
        </div>
        <p className={styles.subtitle}>{subtitle || defaultSubtitle}</p>
      </div>

      {rightSlot && <div className={styles.rightSlot}>{rightSlot}</div>}
    </div>
  );
}
