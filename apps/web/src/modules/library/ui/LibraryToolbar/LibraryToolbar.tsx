import { SearchInput } from '../../../../shared';
import type { LibrarySortBy } from '../../models';
import type { LibraryToolbarProps } from './LibraryToolbar.types';
import styles from '../Library.module.css';

export function LibraryToolbar({
  searchTerm,
  onSearchChange,
  onClearSearch,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder,
  isLikedTab = false,
}: LibraryToolbarProps) {
  return (
    <div className={styles['library-toolbar']}>
      {/* Search Input */}
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        onClear={onClearSearch}
        placeholder="Пошук у бібліотеці..."
        maxWidth={400}
      />

      {/* Sort Options */}
      <div className={styles['library-sort-wrapper']}>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as LibrarySortBy)}
          className={styles['library-sort-select']}
          aria-label="Сортування"
        >
          {isLikedTab ? (
            <option value="updatedAt">За датою додавання</option>
          ) : (
            <option value="updatedAt">Останні змінені</option>
          )}
          <option value="createdAt">За датою створення</option>
          <option value="name">За назвою</option>
        </select>

        <button
          type="button"
          className={styles['library-sort-order-btn']}
          onClick={onToggleSortOrder}
          title={sortOrder === 'asc' ? 'За зростанням' : 'За спаданням'}
          aria-label={sortOrder === 'asc' ? 'За зростанням' : 'За спаданням'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sortOrder === 'asc' ? (
              <>
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </>
            ) : (
              <>
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
