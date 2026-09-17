import type { DraftsToolbarProps } from './DraftsToolbar.types';
import { ClockIcon, CalendarIcon } from '../../../../shared';
import styles from '../Drafts.module.css';

export function DraftsToolbar({
  sortBy,
  sortOrder,
  onSortByChange,
  onToggleOrder,
}: DraftsToolbarProps) {
  return (
    <div className={styles['drafts-toolbar']}>
      <div className={styles['drafts-sort-group']}>
        <span className={styles['sort-label']}>Сортування:</span>

        <div className={styles['sort-buttons']}>
          <button
            type="button"
            className={`${styles['sort-btn']} ${sortBy === 'updatedAt' ? styles['is-active'] : ''}`}
            onClick={() => onSortByChange('updatedAt')}
          >
            <ClockIcon size={14} />
            <span>За датою оновлення</span>
          </button>

          <button
            type="button"
            className={`${styles['sort-btn']} ${sortBy === 'createdAt' ? styles['is-active'] : ''}`}
            onClick={() => onSortByChange('createdAt')}
          >
            <CalendarIcon size={14} />
            <span>За датою створення</span>
          </button>
        </div>

        <button
          type="button"
          className={styles['sort-direction-btn']}
          onClick={onToggleOrder}
          title={sortOrder === 'desc' ? 'Спочатку новіші' : 'Спочатку старіші'}
        >
          <span>{sortOrder === 'desc' ? '↓ Новіші спочатку' : '↑ Старіші спочатку'}</span>
        </button>
      </div>
    </div>
  );
}
