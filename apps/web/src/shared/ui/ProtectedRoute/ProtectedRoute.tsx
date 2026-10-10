import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserContext } from '../../../modules/auth/context';
import { createLoginRedirectUrl } from '../../../modules/auth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useUserContext();
  const location = useLocation();

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

  if (!isAuthenticated) {
    const targetUrl = createLoginRedirectUrl(
      location.pathname + location.search,
    );
    return <Navigate to={targetUrl} replace />;
  }

  return <Outlet />;
}
