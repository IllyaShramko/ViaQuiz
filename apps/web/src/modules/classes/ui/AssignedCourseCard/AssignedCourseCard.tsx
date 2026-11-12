import { Link } from 'react-router-dom';
import { ArrowRightIcon, pluralizeUk } from '../../../../shared';
import type { AssignedCourseCardProps } from './AssignedCourseCard.types';
import styles from './AssignedCourseCard.module.css';

export function AssignedCourseCard({
  course,
  onLeaveCourse,
}: AssignedCourseCardProps) {
  const curatorName =
    course.creator.firstName && course.creator.lastName
      ? `${course.creator.firstName} ${course.creator.lastName}`
      : `@${course.creator.login}`;

  const studentsWord = pluralizeUk(course._count.students, [
    'учень',
    'учні',
    'учнів',
  ]);
  const roomsWord = pluralizeUk(course._count.rooms, [
    'тестування',
    'тестування',
    'тестувань',
  ]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h3 className={styles.courseName}>{course.name}</h3>
          <span className={styles.classTag}>{course.classroom.name}</span>
        </div>

        <div className={styles.metaRow}>
          <span>
            <span className={styles.metaStrong}>{course._count.students}</span>{' '}
            {studentsWord}
          </span>
          <span className={styles.metaDot}>·</span>
          <span>
            <span className={styles.metaStrong}>{course._count.rooms}</span>{' '}
            {roomsWord}
          </span>
        </div>

        <span className={styles.curatorText}>
          Куратор:{' '}
          <span className={styles.curatorHighlight}>{curatorName}</span>
        </span>
      </div>

      <div className={styles.footer}>
        <Link
          to={`/classes/${course.classroom.uuid}/courses/${course.uuid}`}
          className={styles.viewLink}
        >
          <span>Відкрити курс</span>
          <ArrowRightIcon size={14} className={styles.viewLinkArrow} />
        </Link>

        <button
          type="button"
          className={styles.leaveButton}
          onClick={() =>
            onLeaveCourse(course.classroom.uuid, course.uuid, course.name)
          }
          title="Покинути керівництво цим курсом"
        >
          Покинути курс
        </button>
      </div>
    </div>
  );
}
