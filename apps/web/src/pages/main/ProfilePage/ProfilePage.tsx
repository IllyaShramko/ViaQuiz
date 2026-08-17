import { useUserContext } from '../../../modules/auth/context';
import './ProfilePage.css';

export function ProfilePage() {
  const { user } = useUserContext();

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.login || 'Шрамко Ілля';

  const username = user?.login || 'IllyaShramko';
  const email = user?.email || 'shramko@example.com';

  return (
    <div className="teacher-profile-page">
      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-info__main">
            <h2 className="profile-name">{fullName}</h2>
            <span className="profile-username">@{username}</span>
          </div>

          <div className="profile-badge">
            <span className="badge-role">Викладач</span>
          </div>
        </div>
      </div>

      {/* Profile Details & Stats */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <div className="profile-stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div className="profile-stat-card__content">
            <span className="profile-stat-number">0</span>
            <span className="profile-stat-label">Створених вікторин</span>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="profile-stat-card__content">
            <span className="profile-stat-number">0</span>
            <span className="profile-stat-label">Активних класів</span>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-card__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div className="profile-stat-card__content">
            <span className="profile-stat-number">0</span>
            <span className="profile-stat-label">Проведених ігор</span>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="profile-section-card">
        <h3 className="profile-section-title">Інформація про акаунт</h3>
        
        <div className="profile-details-list">
          <div className="profile-detail-row">
            <span className="profile-detail-label">Email</span>
            <span className="profile-detail-value">{email}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label">Логін</span>
            <span className="profile-detail-value">{username}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label">Статус</span>
            <span className="profile-detail-value status-active">Активний</span>
          </div>
        </div>
      </div>
    </div>
  );
}
