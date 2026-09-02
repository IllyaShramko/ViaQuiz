import type { LibrarySortBy, LibrarySortOrder } from '../../models';

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
