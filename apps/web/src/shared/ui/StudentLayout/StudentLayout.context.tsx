import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { StudentHeaderConfig, StudentLayoutContextValue } from './StudentLayout.types';

export const StudentLayoutContext = createContext<StudentLayoutContextValue | null>(null);

export interface StudentLayoutProviderProps {
  children: ReactNode;
}

export function StudentLayoutProvider({ children }: StudentLayoutProviderProps) {
  const [headerConfig, setHeaderConfigState] = useState<StudentHeaderConfig>({});

  const setHeaderConfig = useCallback((nextConfig: StudentHeaderConfig) => {
    setHeaderConfigState((prev) => {
      if (
        prev.title === nextConfig.title &&
        prev.badge === nextConfig.badge &&
        prev.showBack === nextConfig.showBack &&
        prev.backTo === nextConfig.backTo &&
        prev.backLabel === nextConfig.backLabel &&
        prev.actions === nextConfig.actions
      ) {
        return prev;
      }
      return nextConfig;
    });
  }, []);

  const resetHeaderConfig = useCallback(() => {
    setHeaderConfigState({});
  }, []);

  const value: StudentLayoutContextValue = {
    headerConfig,
    setHeaderConfig,
    resetHeaderConfig,
  };

  return (
    <StudentLayoutContext.Provider value={value}>
      {children}
    </StudentLayoutContext.Provider>
  );
}

/**
 * Hook to access the raw StudentLayout context.
 */
export function useStudentLayout(): StudentLayoutContextValue {
  const context = useContext(StudentLayoutContext);
  if (!context) {
    throw new Error('useStudentLayout must be used within a StudentLayoutProvider');
  }
  return context;
}

/**
 * Hook for pages inside StudentLayout to declaratively configure the header topbar.
 *
 * @param config Header options (title, badge, showBack, backTo, backLabel, actions)
 * @param deps Optional custom dependency array to re-apply header configuration
 */
export function useStudentHeader(config: StudentHeaderConfig, deps?: unknown[]) {
  const { setHeaderConfig, resetHeaderConfig } = useStudentLayout();

  const dependencies = deps
    ? [setHeaderConfig, ...deps]
    : [
        setHeaderConfig,
        config.title,
        config.badge,
        config.showBack,
        config.backTo,
        config.backLabel,
        config.actions,
      ];

  useEffect(() => {
    setHeaderConfig(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    return () => {
      resetHeaderConfig();
    };
  }, [resetHeaderConfig]);
}
