import { PlusIcon } from '../../../../../shared';
import type { CourseTabsProps } from './CourseTabs.types';
import styles from './CourseTabs.module.css';

export function CourseTabs({
  activeTab,
  onTabChange,
  studentsCount,
  onOpenEnrollModal,
  maxStudents = 50,
}: CourseTabsProps) {
  return (
    <div className={styles.nav}>
      <div className={styles.tabs} role="tablist" aria-label="Розділи курсу">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'students'}
          className={`${styles.tabButton} ${activeTab === 'students' ? styles.isActive : ''}`}
          onClick={() => onTabChange('students')}
        >
          <span>Учні</span>
          <span className={styles.countBadge}>{studentsCount}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'performance'}
          className={`${styles.tabButton} ${activeTab === 'performance' ? styles.isActive : ''}`}
          onClick={() => onTabChange('performance')}
        >
          <span>Успішність</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'history'}
          className={`${styles.tabButton} ${activeTab === 'history' ? styles.isActive : ''}`}
          onClick={() => onTabChange('history')}
        >
          <span>Історія сесій</span>
        </button>
      </div>

      <div className={styles.actions}>
        {activeTab === 'students' && (
          <button
            type="button"
            className={styles.primaryAction}
            onClick={onOpenEnrollModal}
            disabled={studentsCount >= maxStudents}
          >
            <PlusIcon size={15} />
            <span>Зарахувати учнів</span>
          </button>
        )}
      </div>
    </div>
  );
}
