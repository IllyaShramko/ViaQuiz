export interface DraftCreateCardProps {
  canCreateMore: boolean;
  isCreating: boolean;
  maxDrafts?: number;
  onCreate: () => void;
}
