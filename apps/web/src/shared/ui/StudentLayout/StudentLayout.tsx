import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useUserContext } from '../../../modules/auth/context';
import { isTeacher } from '../../../modules/auth/utils';
import styles from './StudentLayout.module.css';

export function StudentLayout() {
  const { user, logout } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  if (isTeacher(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    navigate('/', { replace: true });
    setTimeout(() => {
      logout();
    }, 10);
  };

  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.login || 'Учень';

  return (
    <div className={styles['student-layout']}>
      {/* Mobile backdrop */}
      {isMobileNavOpen && (
        <div
          className={styles['mobile-backdrop']}
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles['student-sidebar']} ${isMobileNavOpen ? styles['sidebar-open'] : ''}`}>
        <div className={styles['student-sidebar__header']}>
          <Link to="/student/dashboard" className={styles['student-logo']} onClick={() => setIsMobileNavOpen(false)}>
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={styles['student-logo__icon']}>
              <g transform="translate(-164, -2239)">
                <path
                  fill="currentColor"
                  d="M180.408,2250.776 C178.985,2252.601 177.497,2254.062 175.774,2255.404 C177.201,2256.228 180.549,2257.722 181.634,2256.637 C182.375,2255.897 182.034,2253.581 180.408,2250.776 M174.002,2254.251 C175.984,2252.802 177.798,2250.988 179.247,2249.006 C177.804,2247.032 175.991,2245.216 174.002,2243.761 C172.005,2245.22 170.195,2247.038 168.755,2249.006 C170.204,2250.989 172.019,2252.802 174.002,2254.251 M172.228,2255.404 C170.501,2254.058 169.013,2252.597 167.594,2250.776 C165.968,2253.581 165.627,2255.897 166.368,2256.637 C167.443,2257.711 170.762,2256.252 172.228,2255.404 M167.594,2247.236 C169.016,2245.411 170.504,2243.952 172.228,2242.609 C170.803,2241.784 167.454,2240.29 166.368,2241.375 C165.627,2242.116 165.968,2244.431 167.594,2247.236 M175.774,2242.609 C177.501,2243.954 178.988,2245.414 180.408,2247.236 C184.018,2241.009 181.288,2239.422 175.774,2242.609 M181.664,2249.006 C187.098,2257.497 182.428,2262.065 174.002,2256.674 C165.595,2262.052 160.886,2257.525 166.339,2249.006 C160.942,2240.574 165.492,2235.895 174.002,2241.338 C182.425,2235.95 187.103,2240.508 181.664,2249.006 M175.065,2247.946 C175.649,2248.53 175.649,2249.478 175.065,2250.062 C174.481,2250.646 173.532,2250.646 172.948,2250.062 C172.363,2249.478 172.363,2248.53 172.948,2247.946 C173.532,2247.361 174.481,2247.361 175.065,2247.946"
                />
              </g>
            </svg>
            <span className={styles['student-logo__text']}>ViaQuiz</span>
          </Link>

          <button
            type="button"
            className={styles['mobile-close-btn']}
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Закрити меню"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles['student-sidebar__nav']}>
          <Link
            to="/student/class"
            className={`${styles['student-nav-item']} ${location.pathname === '/student/class' ? styles['is-active'] : ''}`}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <svg className={styles['student-nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Мій клас</span>
          </Link>

          <Link
            to="/student/performance"
            className={`${styles['student-nav-item']} ${location.pathname === '/student/performance' ? styles['is-active'] : ''}`}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <svg className={styles['student-nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span>Моя успішність</span>
          </Link>

          <Link
            to="/student/history"
            className={`${styles['student-nav-item']} ${location.pathname === '/student/history' ? styles['is-active'] : ''}`}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <svg className={styles['student-nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Історія тестів</span>
          </Link>

          <Link
            to="/student/courses"
            className={`${styles['student-nav-item']} ${location.pathname.startsWith('/student/courses') ? styles['is-active'] : ''}`}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <svg className={styles['student-nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Мої курси</span>
          </Link>

          <Link
            to="/student/profile"
            className={`${styles['student-nav-item']} ${location.pathname === '/student/profile' ? styles['is-active'] : ''}`}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <svg className={styles['student-nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Профіль</span>
          </Link>
        </nav>

        <div className={styles['student-sidebar__footer']}>
          © {new Date().getFullYear()} ViaQuiz<br />
          Кабінет учня
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles['student-main-wrapper']}>
        {/* Topbar */}
        <header className={styles['student-topbar']}>
          <div className={styles['student-topbar__left']}>
            <button
              type="button"
              className={styles['mobile-menu-btn']}
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Відкрити меню"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1 className={styles['student-topbar__title']}>
              {location.pathname === '/student/dashboard'
                ? 'Головна'
                : location.pathname === '/student/class'
                ? 'Мій клас'
                : location.pathname === '/student/performance'
                ? 'Моя успішність'
                : location.pathname === '/student/history'
                ? 'Історія тестувань'
                : location.pathname === '/student/courses'
                ? 'Мої курси'
                : 'Профіль'}
            </h1>
          </div>

          <div className={styles['student-topbar__actions']}>
            <Link to="/join" className={styles['btn-enter-code']}>
              Введіть код
            </Link>

            <Link to="/student/profile" className={styles['student-user-profile-link']} title="Мій профіль">
              <span>{displayName}</span>
            </Link>

            <button
              type="button"
              className={styles['student-logout-btn']}
              onClick={handleLogout}
              title="Вийти з акаунту"
              aria-label="Вийти"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className={styles['student-content']}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
