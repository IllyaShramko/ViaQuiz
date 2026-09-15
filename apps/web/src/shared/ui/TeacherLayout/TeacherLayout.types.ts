import type { ReactNode } from 'react';

/**
 * Configuration options for the TeacherLayout header/topbar.
 */
export interface TeacherHeaderConfig {
  /** Page title displayed in the topbar */
  title?: string;
  /** Additional element placed to the right of the title (e.g. badge, status, action button) */
  badge?: ReactNode;
  /** Whether to display the standalone back button */
  showBack?: boolean;
  /** Navigation target path or custom click handler for the back button */
  backTo?: string | (() => void);
  /** Accessibility label and tooltip for the back button */
  backLabel?: string;
  /** Action elements displayed on the right side of the topbar */
  actions?: ReactNode;
}

/**
 * Contract for the TeacherLayout context.
 */
export interface TeacherLayoutContextValue {
  headerConfig: TeacherHeaderConfig;
  setHeaderConfig: (config: TeacherHeaderConfig) => void;
  resetHeaderConfig: () => void;
}

/**
 * Props for the TeacherLayout component.
 */
export interface TeacherLayoutProps {
  children?: ReactNode;
}
