import { useSearchParams } from 'react-router-dom';
import { useUserContext } from '../../../modules/auth/context';
import {
  AccountEmailSection,
  ProfileSettingsSection,
  SecuritySettingsSection,
  SettingsHeader,
  SettingsSidebar,
  type SettingsTabId,
} from '../../../modules/settings';
import { useTeacherHeader } from '../../../shared';
import styles from './SettingsPage.module.css';

const VALID_TABS: ReadonlySet<SettingsTabId> = new Set(['profile', 'email', 'security']);

function resolveTab(rawTab: string | null): SettingsTabId {
  if (rawTab && VALID_TABS.has(rawTab as SettingsTabId)) {
    return rawTab as SettingsTabId;
  }
  return 'profile';
}

export function SettingsPage() {
  useTeacherHeader({
    title: 'Налаштування',
    showBack: true,
    backTo: '/dashboard',
    backLabel: 'Назад до головної',
  });

  const { user } = useUserContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveTab(searchParams.get('tab'));

  const handleSelectTab = (tab: SettingsTabId) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className={styles.container}>
      <SettingsHeader user={user} />

      <div className={styles.layoutGrid}>
        <SettingsSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

        <div className={styles.contentPanel} role="tabpanel">
          {activeTab === 'profile' && <ProfileSettingsSection user={user} />}
          {activeTab === 'email' && <AccountEmailSection user={user} />}
          {activeTab === 'security' && (
            <SecuritySettingsSection
              login={user?.login}
              userEmail={user?.email ?? ''}
            />
          )}
        </div>
      </div>
    </div>
  );
}
