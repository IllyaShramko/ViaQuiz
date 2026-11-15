import type { ReactNode } from 'react';

export interface DraftsHeroProps {
  title?: string;
  subtitle?: string;
  draftsCount?: number;
  maxDrafts?: number;
  rightSlot?: ReactNode;
}
