import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useGetClassroomsQuery,
  CreateClassModal,
  AssignedCourseCard,
  CourseInvitationsBanner,
  PendingInvitationsModal,
  LeaveCourseModal,
} from '../../../modules/classes';
import { ArrowRightIcon, PlusIcon, useTeacherHeader } from '../../../shared';
import styles from './ClassesPage.module.css';

export function ClassesPage() {
  useTeacherHeader({ title: 'Мої класи' });
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, error } = useGetClassroomsQuery();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(() =>
    Boolean(searchParams.get('inviteToken')),
  );

  // Leave course state
  const [leaveModalState, setLeaveModalState] = useState<{
    isOpen: boolean;
    classUuid: string;
    courseUuid: string;
    courseName: string;
  }>({
    isOpen: false,
    classUuid: '',
    courseUuid: '',
    courseName: '',
  });

  const classrooms = data?.classrooms || [];
  const assignedCourses = data?.assignedCourses || [];
  const pendingCount = data?.pendingInvitationsCount || 0;

  const limits = data?.limits || {
    maxClasses: 8,
    currentActiveClasses: 0,
    maxTotalCourses: 30,
    currentActiveCourses: 0,
    maxStudentsPerClass: 50,
    maxCoursesPerClass: 15,
    maxStudentsPerCourse: 50,
  };

  // Clean up inviteToken query param after initializing modal visibility
  useEffect(() => {
    if (searchParams.get('inviteToken')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('inviteToken');
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenLeaveCourse = (
    classUuid: string,
    courseUuid: string,
    courseName: string,
  ) => {
    setLeaveModalState({
      isOpen: true,
      classUuid,
      courseUuid,
      courseName,
    });
  };

  return (
    <div className={styles.container}>
      <CourseInvitationsBanner
        count={pendingCount}
        onOpenModal={() => setIsPendingInvitationsOpen(true)}
      />

      <div className={styles.toolbar}>
        <div className={styles.headingGroup}>
          <div className={styles.headingRow}>
            <h2 className={styles.sectionTitle}>Класи</h2>
            <span className={styles.capacityBadge}>
              {limits.currentActiveClasses} / {limits.maxClasses}
            </span>
          </div>
          <p className={styles.sectionSubtitle}>
            Керуйте класами, учнями та навчальними курсами
          </p>
        </div>

        {classrooms.length > 0 && (
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={limits.currentActiveClasses >= limits.maxClasses}
          >
            <PlusIcon size={15} />
            <span>Створити клас</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loadingState}>Завантаження класів...</div>
      ) : error ? (
        <div className={styles.errorBanner}>
          Помилка завантаження списку класів. Спробуйте оновити сторінку.
        </div>
      ) : classrooms.length === 0 ? (
        <div className={styles.emptyCard}>
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={styles.emptyIcon}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          <h3 className={styles.emptyTitle}>У вас ще немає створених класів</h3>
          <p className={styles.emptySubtitle}>
            Створіть свій перший клас, додайте учнів та організовуйте курси
          </p>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={() => setIsCreateModalOpen(true)}
          >
            <PlusIcon size={15} />
            <span>Створити перший клас</span>
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {classrooms.map((classroom) => {
            const studentCount = classroom._count?.students || 0;
            const coursesCount = classroom._count?.courses || 0;
            const studentPercent = Math.min(
              100,
              Math.round((studentCount / limits.maxStudentsPerClass) * 100),
            );

            return (
              <Link
                key={classroom.uuid}
                to={`/classes/${classroom.uuid}`}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{classroom.name}</h3>
                  <ArrowRightIcon size={16} className={styles.cardArrow} />
                </div>

                <div className={styles.cardMeta}>
                  <span>
                    <span className={styles.metaStrong}>{studentCount}</span> /{' '}
                    {limits.maxStudentsPerClass} учнів
                  </span>
                  <span className={styles.metaDot}>·</span>
                  <span>
                    <span className={styles.metaStrong}>{coursesCount}</span> /{' '}
                    {limits.maxCoursesPerClass} курсів
                  </span>
                </div>

                <div
                  className={styles.progressTrack}
                  aria-label={`Заповненість класу: ${studentCount} з ${limits.maxStudentsPerClass}`}
                >
                  <div
                    className={styles.progressFill}
                    style={{ width: `${studentPercent}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {assignedCourses.length > 0 && (
        <section className={styles.assignedSection}>
          <div className={styles.headingGroup}>
            <div className={styles.headingRow}>
              <h2 className={styles.sectionTitle}>Курси під моїм керівництвом</h2>
              <span className={styles.capacityBadge}>{assignedCourses.length}</span>
            </div>
            <p className={styles.sectionSubtitle}>
              Курси в інших класах, де вас призначено ведучим викладачем
            </p>
          </div>

          <div className={styles.grid}>
            {assignedCourses.map((course) => (
              <AssignedCourseCard
                key={course.uuid}
                course={course}
                onLeaveCourse={handleOpenLeaveCourse}
              />
            ))}
          </div>
        </section>
      )}

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentActiveClasses={limits.currentActiveClasses}
        maxClasses={limits.maxClasses}
      />

      <PendingInvitationsModal
        isOpen={isPendingInvitationsOpen}
        onClose={() => setIsPendingInvitationsOpen(false)}
      />

      <LeaveCourseModal
        isOpen={leaveModalState.isOpen}
        onClose={() =>
          setLeaveModalState({
            isOpen: false,
            classUuid: '',
            courseUuid: '',
            courseName: '',
          })
        }
        classUuid={leaveModalState.classUuid}
        courseUuid={leaveModalState.courseUuid}
        courseName={leaveModalState.courseName}
      />
    </div>
  );
}
