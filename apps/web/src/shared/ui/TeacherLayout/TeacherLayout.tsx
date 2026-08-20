import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserContext } from '../../../modules/auth/context';
import styles from './TeacherLayout.module.css';

export interface TeacherLayoutProps {
  pageTitle?: string;
  showBack?: boolean;
}

export function TeacherLayout() {
  const { user, logout } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();
  const handleCreateQuiz = () => {
    navigate('/quiz/drafts');
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const isProfile = location.pathname.includes('/profile');
  const isQuizDetails = location.pathname.startsWith('/quiz');
  const isLibrary = location.pathname.startsWith('/library');
  const displayName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.login || 'Користувач';

  return (
    <div className={styles['teacher-layout']}>
      {/* Sidebar */}
      <aside className={styles['teacher-sidebar']}>
        <div className={styles['teacher-sidebar__header']}>
          <Link to="/dashboard" className={styles['teacher-logo']}>
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className={styles['teacher-logo__icon']}>
              <g transform="translate(-164, -2239)">
                <path
                  fill="currentColor"
                  d="M180.408,2250.776 C178.985,2252.601 177.497,2254.062 175.774,2255.404 C177.201,2256.228 180.549,2257.722 181.634,2256.637 C182.375,2255.897 182.034,2253.581 180.408,2250.776 M174.002,2254.251 C175.984,2252.802 177.798,2250.988 179.247,2249.006 C177.804,2247.032 175.991,2245.216 174.002,2243.761 C172.005,2245.22 170.195,2247.038 168.755,2249.006 C170.204,2250.989 172.019,2252.802 174.002,2254.251 M172.228,2255.404 C170.501,2254.058 169.013,2252.597 167.594,2250.776 C165.968,2253.581 165.627,2255.897 166.368,2256.637 C167.443,2257.711 170.762,2256.252 172.228,2255.404 M167.594,2247.236 C169.016,2245.411 170.504,2243.952 172.228,2242.609 C170.803,2241.784 167.454,2240.29 166.368,2241.375 C165.627,2242.116 165.968,2244.431 167.594,2247.236 M175.774,2242.609 C177.501,2243.954 178.988,2245.414 180.408,2247.236 C184.018,2241.009 181.288,2239.422 175.774,2242.609 M181.664,2249.006 C187.098,2257.497 182.428,2262.065 174.002,2256.674 C165.595,2262.052 160.886,2257.525 166.339,2249.006 C160.942,2240.574 165.492,2235.895 174.002,2241.338 C182.425,2235.95 187.103,2240.508 181.664,2249.006 M175.065,2247.946 C175.649,2248.53 175.649,2249.478 175.065,2250.062 C174.481,2250.646 173.532,2250.646 172.948,2250.062 C172.363,2249.478 172.363,2248.53 172.948,2247.946 C173.532,2247.361 174.481,2247.361 175.065,2247.946"
                />
              </g>
            </svg>
            <span className={styles['teacher-logo__text']}>ViaQuiz</span>
          </Link>
        </div>

        <nav className={styles['teacher-sidebar__nav']}>
          <Link
            to="/classes"
            className={`${styles['teacher-nav-item']} ${location.pathname.startsWith('/classes') ? styles['is-active'] : ''}`}
          >
            <svg className={styles['teacher-nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Мої класи</span>
          </Link>

          <Link
            to="/library"
            className={`${styles['teacher-nav-item']} ${location.pathname.startsWith('/library') ? styles['is-active'] : ''}`}
          >
            <svg className={styles['teacher-nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Бібліотека</span>
          </Link>

          <Link
            to="/reports"
            className={`${styles['teacher-nav-item']} ${location.pathname.startsWith('/reports') ? styles['is-active'] : ''}`}
          >
            <svg className={styles['teacher-nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Звіти</span>
          </Link>
        </nav>

        <div className={styles['teacher-sidebar__footer']}>
          <p className={styles['teacher-sidebar__copyright']}>
            © {new Date().getFullYear()} ViaQuiz<br />
            Всі права захищені.
          </p>
        </div>
      </aside>

      {/* Main Area */}
      <div className={styles['teacher-main-wrapper']}>
        {/* Topbar */}
        <header className={styles['teacher-topbar']}>
          <div className={styles['teacher-topbar__left']}>
            {isProfile ? (
              <button
                type="button"
                className={styles['teacher-back-btn']}
                onClick={() => navigate('/dashboard')}
                aria-label="Назад до головної"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span className={styles['teacher-topbar__title']}>Профіль</span>
              </button>
            ) : isQuizDetails ? (
              <button
                type="button"
                className={styles['teacher-back-btn']}
                onClick={() => navigate('/dashboard')}
                aria-label="Назад до головної"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span className={styles['teacher-topbar__title']}>Вікторина</span>
              </button>
            ) : isLibrary ? (
              <h1 className={styles['teacher-topbar__title']}>Бібліотека</h1>
            ) : (
              <h1 className={styles['teacher-topbar__title']}>Головна</h1>
            )}
          </div>

          <div className={styles['teacher-topbar__actions']}>
            <button
              type="button"
              className={styles['btn-teacher-create']}
              onClick={handleCreateQuiz}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Створити</span>
            </button>

            <Link to="/#enter-code" className={styles['btn-teacher-code']}>
              Введіть код
            </Link>

            <Link to="/profile" className={styles['teacher-user-profile-link']} title="Перейти до профілю">
              <span className={styles['teacher-user-name']}>{displayName}</span>
            </Link>

            <button
              type="button"
              className={styles['teacher-logout-btn']}
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
        <main className={styles['teacher-content']}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
