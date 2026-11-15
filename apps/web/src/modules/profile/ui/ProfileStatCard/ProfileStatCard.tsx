import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../../../../shared';
import type { ProfileStatCardProps } from './ProfileStatCard.types';
import styles from './ProfileStatCard.module.css';

export function ProfileStatCard({
  icon,
  value,
  label,
  to,
  isLoading = false,
}: ProfileStatCardProps) {
  const isZero = value === 0 || value === '0';

  const content = (
    <>
      <div className={styles.labelRow}>
        <span className={styles.labelMeta}>
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
          <span className={styles.label}>{label}</span>
        </span>
        {to && <ArrowRightIcon size={13} className={styles.arrow} aria-hidden="true" />}
      </div>

      {isLoading ? (
        <div className={styles.valueSkeleton} aria-label="Завантаження" />
      ) : (
        <span className={`${styles.value} ${isZero ? styles.valueMuted : ''}`}>
          {value}
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${styles.cell} ${styles.cellInteractive}`}>
        {content}
      </Link>
    );
  }

  return <div className={styles.cell}>{content}</div>;
}
