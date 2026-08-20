import type { SortOrder } from '@viaquiz/shared-types';
import styles from '../Drafts.module.css';

export type DraftSortField = 'updatedAt' | 'createdAt';
export type DraftSortOrder = SortOrder;

export interface DraftsToolbarProps {
  sortBy: DraftSortField;
  sortOrder: DraftSortOrder;
  onSortByChange: (field: DraftSortField) => void;
  onToggleOrder: () => void;
}

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
            🕒 За датою оновлення
          </button>

          <button
            type="button"
            className={`${styles['sort-btn']} ${sortBy === 'createdAt' ? styles['is-active'] : ''}`}
            onClick={() => onSortByChange('createdAt')}
          >
            📅 За датою створення
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
