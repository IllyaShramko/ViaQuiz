import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useUserContext, getUserDashboardPath, getSafeRedirectUrl } from '../../../modules/auth';

export function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useUserContext();
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--color-bg, #0a0a0f)',
          color: 'var(--color-text-secondary, #9090a8)',
          fontSize: '1.1rem',
        }}
      >
        Завантаження...
      </div>
    );
  }

  if (isAuthenticated) {
    const defaultPath = getUserDashboardPath(user);
    const targetUrl = getSafeRedirectUrl(searchParams, defaultPath);
    return <Navigate to={targetUrl} replace />;
  }

  return <Outlet />;
}
