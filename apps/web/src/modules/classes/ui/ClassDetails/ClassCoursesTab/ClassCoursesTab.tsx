import { Link } from 'react-router-dom';
import { ArrowRightIcon, PlusIcon, pluralizeUk } from '../../../../../shared';
import type { ClassCoursesTabProps } from './ClassCoursesTab.types';
import styles from './ClassCoursesTab.module.css';

export function ClassCoursesTab({
  classUuid,
  courses,
  maxStudentsPerCourse = 50,
  onOpenCreateCourse,
}: ClassCoursesTabProps) {
  if (courses.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <h3 className={styles.emptyTitle}>Курсів ще не створено</h3>
        <p className={styles.emptySubtitle}>
          Створюйте окремі курси (наприклад, Алгебра, Фізика) та зараховуйте учнів із цього класу.
        </p>
        <button
          type="button"
          className={styles.emptyAction}
          onClick={onOpenCreateCourse}
        >
          <PlusIcon size={15} />
          <span>Створити курс</span>
        </button>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {courses.map((course) => {
        const enrolledCount = course._count?.students ?? 0;
        const roomsCount = course._count?.rooms ?? 0;
        const enrollmentPercent = Math.min(
          100,
          Math.round((enrolledCount / maxStudentsPerCourse) * 100),
        );
        const sessionsWord = pluralizeUk(roomsCount, ['сесія', 'сесії', 'сесій']);

        return (
          <Link
            key={course.uuid}
            to={`/classes/${classUuid}/courses/${course.uuid}`}
            className={styles.card}
          >
            <div className={styles.header}>
              <h3 className={styles.title}>{course.name}</h3>
              <ArrowRightIcon size={16} className={styles.arrow} />
            </div>

            <div className={styles.meta}>
              <span>
                <span className={styles.metaStrong}>{enrolledCount}</span> / {maxStudentsPerCourse} учнів
              </span>
              <span className={styles.metaDot}>·</span>
              <span>
                <span className={styles.metaStrong}>{roomsCount}</span> {sessionsWord}
              </span>
            </div>

            <div
              className={styles.progressTrack}
              aria-label={`Заповненість курсу: ${enrolledCount} з ${maxStudentsPerCourse}`}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${enrollmentPercent}%` }}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
