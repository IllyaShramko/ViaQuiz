import { pluralize } from '../../../../shared';
import type { CourseInvitationsBannerProps } from './CourseInvitationsBanner.types';
import styles from './CourseInvitationsBanner.module.css';

export function CourseInvitationsBanner({
  count,
  onOpenModal,
}: CourseInvitationsBannerProps) {
  if (count <= 0) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.leftSection}>
        <div className={styles.iconWrapper}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className={styles.textContent}>
          <h4 className={styles.title}>
            У вас є {count}{' '}
            {pluralize(count, {
              uk: ['нове запрошення', 'нові запрошення', 'нових запрошень'],
              en: ['new invitation', 'new invitations'],
            })}{' '}
            на керівництво {count === 1 ? 'курсом' : 'курсами'}
          </h4>
          <p className={styles.subtitle}>
            Куратори запросили вас стати ведучим викладачем у своїх курсах.
          </p>
        </div>
      </div>

      <button type="button" className={styles.viewBtn} onClick={onOpenModal}>
        <span>Переглянути ({count})</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
