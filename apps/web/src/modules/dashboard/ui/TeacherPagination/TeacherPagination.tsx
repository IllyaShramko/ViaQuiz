import type { TeacherPaginationProps } from './TeacherPagination.types';
import { ArrowLeftIcon, ArrowRightIcon } from '../../../../shared';
import styles from '../Dashboard.module.css';

export function TeacherPagination({
  page,
  totalPages,
  onPageChange,
}: TeacherPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={styles['teacher-pagination']}>
      <button
        type="button"
        className={styles['teacher-pagination-btn']}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ArrowLeftIcon size={14} />
        <span>Попередня</span>
      </button>

      <span className={styles['teacher-pagination-info']}>
        Сторінка {page} з {totalPages}
      </span>

      <button
        type="button"
        className={styles['teacher-pagination-btn']}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <span>Наступна</span>
        <ArrowRightIcon size={14} />
      </button>
    </div>
  );
}
