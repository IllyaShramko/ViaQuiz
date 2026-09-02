import type { LibraryTabsProps } from './LibraryTabs.types';
import styles from '../Library.module.css';

export function LibraryTabs({
  activeTab,
  onTabChange,
  myTotal,
  likedTotal,
}: LibraryTabsProps) {
  return (
    <nav className={styles['library-tabs']} aria-label="Розділи бібліотеки">
      <button
        type="button"
        className={`${styles['library-tab-btn']} ${activeTab === 'my' ? styles['is-active'] : ''}`}
        onClick={() => onTabChange('my')}
      >
        <span>Мої вікторини</span>
        <span className={styles['library-tab-badge']}>{myTotal}</span>
      </button>

      <button
        type="button"
        className={`${styles['library-tab-btn']} ${activeTab === 'liked' ? styles['is-active'] : ''}`}
        onClick={() => onTabChange('liked')}
      >
        <span>Вподобані</span>
        <span className={styles['library-tab-badge']}>{likedTotal}</span>
      </button>
    </nav>
  );
}
