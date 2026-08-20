import type { LibrarySortBy, LibrarySortOrder } from '../../models';
import styles from '../Library.module.css';

export interface LibraryToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  sortBy: LibrarySortBy;
  onSortByChange: (sortBy: LibrarySortBy) => void;
  sortOrder: LibrarySortOrder;
  onToggleSortOrder: () => void;
  isLikedTab?: boolean;
}

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
      <div className={styles['library-search-wrapper']}>
        <svg
          className={styles['library-search-icon']}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Пошук у бібліотеці..."
          className={styles['library-search-input']}
        />

        {searchTerm && (
          <button
            type="button"
            className={styles['library-search-clear-btn']}
            onClick={onClearSearch}
            aria-label="Очистити пошук"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

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
