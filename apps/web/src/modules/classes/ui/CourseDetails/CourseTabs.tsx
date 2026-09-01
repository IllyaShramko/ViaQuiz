import styles from '../Classes.module.css';

export type CourseTabType = 'students' | 'performance' | 'history';

interface CourseTabsProps {
  activeTab: CourseTabType;
  onTabChange: (tab: CourseTabType) => void;
  studentsCount: number;
  onOpenEnrollModal: () => void;
  maxStudents?: number;
}

export function CourseTabs({
  activeTab,
  onTabChange,
  studentsCount,
  onOpenEnrollModal,
  maxStudents = 50,
}: CourseTabsProps) {
  return (
    <div className={styles['class-detail-nav']}>
      <div className={styles['class-tabs']}>
        <button
          type="button"
          className={`${styles['tab-btn']} ${activeTab === 'students' ? styles['is-active'] : ''}`}
          onClick={() => onTabChange('students')}
        >
          Учні ({studentsCount})
        </button>
        <button
          type="button"
          className={`${styles['tab-btn']} ${activeTab === 'performance' ? styles['is-active'] : ''}`}
          onClick={() => onTabChange('performance')}
        >
          Успішність
        </button>
        <button
          type="button"
          className={`${styles['tab-btn']} ${activeTab === 'history' ? styles['is-active'] : ''}`}
          onClick={() => onTabChange('history')}
        >
          Історія
        </button>
      </div>

      <div className={styles['class-actions-row']}>
        {activeTab === 'students' && studentsCount > 0 && (
          <button
            type="button"
            className={styles['btn-create-class']}
            onClick={onOpenEnrollModal}
            disabled={studentsCount >= maxStudents}
            title={
              studentsCount >= maxStudents
                ? `Досягнуто ліміту в ${maxStudents} учнів для курсу`
                : 'Зарахувати учнів з класу до цього курсу'
            }
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Зарахувати учнів
          </button>
        )}
      </div>
    </div>
  );
}
