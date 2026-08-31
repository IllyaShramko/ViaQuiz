import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserContext } from '../../../modules/auth/context';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, token } = useUserContext();
  const location = useLocation();
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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
