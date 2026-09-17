import type { TeacherHeroSearchProps } from './TeacherHeroSearch.types';
import styles from './TeacherHeroSearch.module.css';

export function TeacherHeroSearch({
  title = 'Що ви бажаєте викладати сьогодні?',
  placeholder = 'Шукати вікторини за назвою або темою...',
  searchTerm,
  onSearchChange,
  onClear,
}: TeacherHeroSearchProps) {
  return (
    <section className={styles['teacher-hero-search']}>
      <h2 className={styles['teacher-hero-search__title']}>{title}</h2>

      <div className={styles['teacher-search-box']}>
        <svg
          className={styles['teacher-search-icon']}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          className={styles['teacher-search-input']}
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        {searchTerm && (
          <button
            type="button"
            className={styles['teacher-search-clear-btn']}
            onClick={onClear}
            aria-label="Очистити пошук"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
