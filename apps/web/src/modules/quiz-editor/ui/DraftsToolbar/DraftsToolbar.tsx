import { ClockIcon, CalendarIcon } from '../../../../shared';
import type { DraftsToolbarProps } from './DraftsToolbar.types';
import styles from './DraftsToolbar.module.css';

export function DraftsToolbar({
  sortBy,
  sortOrder,
  onSortByChange,
  onToggleOrder,
}: DraftsToolbarProps) {
  return (
    <div className={styles.toolbar} aria-label="Сортування чернеток">
      <div className={styles.tabs} role="tablist" aria-label="Критерій сортування">
        <button
          type="button"
          role="tab"
          aria-selected={sortBy === 'updatedAt'}
          className={`${styles.tabButton} ${sortBy === 'updatedAt' ? styles.isActive : ''}`}
          onClick={() => onSortByChange('updatedAt')}
        >
          <ClockIcon size={13} />
          <span>За оновленням</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={sortBy === 'createdAt'}
          className={`${styles.tabButton} ${sortBy === 'createdAt' ? styles.isActive : ''}`}
          onClick={() => onSortByChange('createdAt')}
        >
          <CalendarIcon size={13} />
          <span>За створенням</span>
        </button>
      </div>

      <button
        type="button"
        className={styles.directionBtn}
        onClick={onToggleOrder}
        title={sortOrder === 'desc' ? 'Спочатку новіші' : 'Спочатку старіші'}
        aria-label={sortOrder === 'desc' ? 'Спочатку новіші' : 'Спочатку старіші'}
      >
        <span>{sortOrder === 'desc' ? '↓ Новіші' : '↑ Старіші'}</span>
      </button>
    </div>
  );
}
