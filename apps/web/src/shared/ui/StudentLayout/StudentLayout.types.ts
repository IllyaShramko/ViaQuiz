import type { ReactNode } from 'react';

/**
 * Configuration options for the StudentLayout header/topbar.
 */
export interface StudentHeaderConfig {
  /** Page title displayed in the topbar */
  title?: string;
  /** Additional element placed to the right of the title */
  badge?: ReactNode;
  /** Whether to display the back button */
  showBack?: boolean;
  /** Navigation target path or custom click handler for the back button */
  backTo?: string | (() => void);
  /** Accessibility label and tooltip for the back button */
  backLabel?: string;
  /** Action elements displayed on the right side of the topbar */
  actions?: ReactNode;
}

/**
 * Contract for the StudentLayout context.
 */
export interface StudentLayoutContextValue {
  headerConfig: StudentHeaderConfig;
  setHeaderConfig: (config: StudentHeaderConfig) => void;
  resetHeaderConfig: () => void;
}

/**
 * Props for the StudentLayout component.
 */
export interface StudentLayoutProps {
  children?: ReactNode;
}
