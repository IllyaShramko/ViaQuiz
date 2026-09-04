import type { ClassmateCardProps } from './ClassmateCard.types';
import styles from './ClassmateCard.module.css';

export function ClassmateCard({ classmate, onClick }: ClassmateCardProps) {
  const firstInitial = classmate.firstName ? classmate.firstName.charAt(0) : '';
  const lastInitial = classmate.lastName ? classmate.lastName.charAt(0) : '';
  const initials = `${firstInitial}${lastInitial}`.toUpperCase() || 'У';

  return (
    <div
      className={`${styles.card} ${classmate.isMe ? styles['card--me'] : ''}`}
      onClick={() => onClick?.(classmate.uuid)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(classmate.uuid);
        }
      }}
    >
      <div className={styles.left}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.info}>
          <div className={styles['name-row']}>
            <h4 className={styles.name}>
              {classmate.firstName} {classmate.lastName}
            </h4>
            {classmate.isMe && <span className={styles['me-badge']}>Ви</span>}
          </div>
          <p className={styles.meta}>
            Пройдено тестів: {classmate.totalQuizzesPassed}
          </p>
        </div>
      </div>
      <div className={styles.chevron} aria-hidden="true">
        ›
      </div>
    </div>
  );
}
