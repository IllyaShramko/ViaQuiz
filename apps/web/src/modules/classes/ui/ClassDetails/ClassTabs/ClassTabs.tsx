import { PlusIcon } from '../../../../../shared';
import type { ClassTabsProps } from './ClassTabs.types';
import styles from './ClassTabs.module.css';

export function ClassTabs({
  activeTab,
  onTabChange,
  studentsCount,
  coursesCount,
  maxStudents = 50,
  maxCourses = 15,
  onOpenAddStudent,
  onOpenCreateCourse,
}: ClassTabsProps) {
  return (
    <div className={styles.nav}>
      <div className={styles.tabs} role="tablist" aria-label="Розділи класу">
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
          aria-selected={activeTab === 'courses'}
          className={`${styles.tabButton} ${activeTab === 'courses' ? styles.isActive : ''}`}
          onClick={() => onTabChange('courses')}
        >
          <span>Курси</span>
          <span className={styles.countBadge}>{coursesCount}</span>
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
          <span>Історія</span>
        </button>
      </div>

      <div className={styles.actions}>
        {activeTab === 'students' && studentsCount > 0 && (
          <button
            type="button"
            className={styles.primaryAction}
            onClick={onOpenAddStudent}
            disabled={studentsCount >= maxStudents}
            title={
              studentsCount >= maxStudents
                ? `Досягнуто ліміту в ${maxStudents} учнів`
                : 'Додати нового учня до класу'
            }
          >
            <PlusIcon size={15} />
            <span>Додати учня</span>
          </button>
        )}

        {activeTab === 'courses' && coursesCount > 0 && (
          <button
            type="button"
            className={styles.primaryAction}
            onClick={onOpenCreateCourse}
            disabled={coursesCount >= maxCourses}
            title={
              coursesCount >= maxCourses
                ? `Досягнуто ліміту в ${maxCourses} курсів`
                : 'Створити новий курс у класі'
            }
          >
            <PlusIcon size={15} />
            <span>Створити курс</span>
          </button>
        )}
      </div>
    </div>
  );
}
