import { Navigate, Outlet } from 'react-router-dom';
import { useUserContext, getUserDashboardPath } from '../../../modules/auth';

export function PublicRoute() {
  const { isAuthenticated, isLoading, user, token } = useUserContext();
  console.log(isAuthenticated, isLoading, token)
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
    return <Navigate to={getUserDashboardPath(user)} replace />;
  }

  return <Outlet />;
}
