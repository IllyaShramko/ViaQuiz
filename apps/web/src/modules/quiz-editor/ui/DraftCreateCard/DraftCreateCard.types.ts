export interface DraftCreateCardProps {
  canCreateMore: boolean;
  isCreating: boolean;
  maxDrafts?: number;
  remainingSlots?: number;
  onCreate: () => void;
}
