import type { ProfileHeaderCardProps } from './ProfileHeaderCard.types';
import styles from '../Profile.module.css';

export function ProfileHeaderCard({
  user,
  roleLabel = 'Викладач',
}: ProfileHeaderCardProps) {
  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.login || 'Користувач';

  const username = user?.login || 'username';

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className={styles['profile-header-card']}>
      <div className={styles['profile-avatar-wrapper']}>
        <div className={styles['profile-avatar']}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>

      <div className={styles['profile-info']}>
        <div className={styles['profile-info__main']}>
          <h2 className={styles['profile-name']}>{fullName}</h2>
          <span className={styles['profile-username']}>@{username}</span>
        </div>

        <div className={styles['profile-badge']}>
          <span className={styles['badge-role']}>{roleLabel}</span>
          {formattedDate && (
            <span className={styles['profile-created-date']}>
              На платформі з {formattedDate}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
