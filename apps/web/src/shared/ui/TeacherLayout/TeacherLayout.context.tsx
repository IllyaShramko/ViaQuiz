import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { TeacherHeaderConfig, TeacherLayoutContextValue } from './TeacherLayout.types';

export const TeacherLayoutContext = createContext<TeacherLayoutContextValue | null>(null);

export interface TeacherLayoutProviderProps {
  children: ReactNode;
}

export function TeacherLayoutProvider({ children }: TeacherLayoutProviderProps) {
  const [headerConfig, setHeaderConfigState] = useState<TeacherHeaderConfig>({});

  const setHeaderConfig = useCallback((nextConfig: TeacherHeaderConfig) => {
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

  const value: TeacherLayoutContextValue = {
    headerConfig,
    setHeaderConfig,
    resetHeaderConfig,
  };

  return (
    <TeacherLayoutContext.Provider value={value}>
      {children}
    </TeacherLayoutContext.Provider>
  );
}

/**
 * Hook to access the raw TeacherLayout context.
 */
export function useTeacherLayout(): TeacherLayoutContextValue {
  const context = useContext(TeacherLayoutContext);
  if (!context) {
    throw new Error('useTeacherLayout must be used within a TeacherLayoutProvider');
  }
  return context;
}

/**
 * Hook for pages inside TeacherLayout to declaratively configure the header topbar.
 *
 * @param config Header options (title, badge, showBack, backTo, backLabel, actions)
 * @param deps Optional custom dependency array to re-apply header configuration
 */
export function useTeacherHeader(config: TeacherHeaderConfig, deps?: unknown[]) {
  const { setHeaderConfig, resetHeaderConfig } = useTeacherLayout();

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
