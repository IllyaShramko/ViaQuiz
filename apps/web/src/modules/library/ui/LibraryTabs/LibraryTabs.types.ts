import type { LibraryTab } from '../../models';

export interface LibraryTabsProps {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  myTotal: number;
  likedTotal: number;
}
