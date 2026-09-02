import type { SortOrder } from '@viaquiz/shared-types';

export type DraftSortField = 'updatedAt' | 'createdAt';
export type DraftSortOrder = SortOrder;

export interface DraftsToolbarProps {
  sortBy: DraftSortField;
  sortOrder: DraftSortOrder;
  onSortByChange: (field: DraftSortField) => void;
  onToggleOrder: () => void;
}
