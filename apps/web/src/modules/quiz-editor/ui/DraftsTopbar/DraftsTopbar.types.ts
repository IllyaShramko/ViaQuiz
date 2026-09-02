export interface DraftsTopbarProps {
  draftsCount: number;
  maxDrafts: number;
  onBack: () => void;
  title?: string;
  backText?: string;
}
