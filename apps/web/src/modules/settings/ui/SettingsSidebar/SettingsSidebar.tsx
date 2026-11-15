import { LockIcon, MailIcon, UserIcon } from '../../../../shared';
import type { SettingsTabId } from '../../models';
import type { SettingsSidebarProps } from './SettingsSidebar.types';
import styles from './SettingsSidebar.module.css';

interface SidebarNavItem {
  id: SettingsTabId;
  label: string;
  icon: typeof UserIcon;
}

const ACCOUNT_ITEMS: SidebarNavItem[] = [
  { id: 'profile', label: 'Особисті дані', icon: UserIcon },
  { id: 'email', label: 'Електронна пошта', icon: MailIcon },
  { id: 'security', label: 'Безпека', icon: LockIcon },
];

export function SettingsSidebar({ activeTab, onSelectTab }: SettingsSidebarProps) {
  return (
    <nav className={styles.sidebar} aria-label="Розділи налаштувань">
      <div className={styles.group}>
        <span className={styles.groupTitle}>Акаунт</span>
        <div className={styles.navList} role="tablist" aria-orientation="vertical">
          {ACCOUNT_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => onSelectTab(item.id)}
              >
                <Icon size={15} className={styles.navIcon} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
