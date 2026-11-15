import { Link } from 'react-router-dom';
import { ArrowRightIcon, getUserDisplayName, getUserInitials } from '../../../../shared';
import type { SettingsHeaderProps } from './SettingsHeader.types';
import styles from './SettingsHeader.module.css';

export function SettingsHeader({ user }: SettingsHeaderProps) {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  return (
    <div className={styles.headerBar}>
      <div className={styles.identity}>
        <span className={styles.avatarChip} aria-hidden="true">
          {initials}
        </span>
        <div className={styles.meta}>
          <div className={styles.titleRow}>
            <span className={styles.name}>{displayName}</span>
            {user?.login && <span className={styles.handle}>@{user.login}</span>}
          </div>
          <span className={styles.subtitle}>Особисті налаштування акаунта</span>
        </div>
      </div>

      <Link to="/profile" className={styles.profileLink}>
        <span>Переглянути профіль</span>
        <ArrowRightIcon size={14} aria-hidden="true" />
      </Link>
    </div>
  );
}
