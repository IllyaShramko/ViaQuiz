import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDownIcon, LogoutIcon, SettingsIcon, UserIcon } from '../../icons';
import { getUserDisplayName, getUserInitials } from '../../../tools';
import type { UserMenuProps } from './UserMenu.types';
import styles from './UserMenu.module.css';

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const isProfileActive = location.pathname === '/profile';
  const isSettingsActive = location.pathname.startsWith('/settings');

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className={styles.menuWrapper} ref={menuRef}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Меню користувача ${displayName}`}
      >
        <span className={styles.avatarChip} aria-hidden="true">
          {initials}
        </span>
        <span className={styles.triggerName}>{displayName}</span>
        <ChevronDownIcon
          size={14}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="menu" aria-label="Меню акаунта">
          <div className={styles.identityHeader}>
            <span className={styles.identityName}>{displayName}</span>
            {user?.login && (
              <span className={styles.identityHandle}>@{user.login}</span>
            )}
          </div>

          <Link
            to="/profile"
            role="menuitem"
            className={`${styles.menuItem} ${isProfileActive ? styles.menuItemActive : ''}`}
            onClick={handleClose}
          >
            <UserIcon size={15} className={styles.menuItemIcon} aria-hidden="true" />
            <span>Профіль</span>
          </Link>

          <Link
            to="/settings"
            role="menuitem"
            className={`${styles.menuItem} ${isSettingsActive ? styles.menuItemActive : ''}`}
            onClick={handleClose}
          >
            <SettingsIcon size={15} className={styles.menuItemIcon} aria-hidden="true" />
            <span>Налаштування</span>
          </Link>

          <div className={styles.divider} role="separator" />

          <button
            type="button"
            role="menuitem"
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            onClick={handleLogoutClick}
          >
            <LogoutIcon size={15} className={styles.menuItemIcon} aria-hidden="true" />
            <span>Вихід</span>
          </button>
        </div>
      )}
    </div>
  );
}
