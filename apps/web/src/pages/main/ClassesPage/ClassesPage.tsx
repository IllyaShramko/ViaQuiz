import { useState, useEffect, type MouseEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useGetClassroomsQuery,
  CreateClassModal,
  AssignedCourseCard,
  CourseInvitationsBanner,
  PendingInvitationsModal,
  LeaveCourseModal,
} from '../../../modules/classes';
import { CheckIcon, CopyIcon, copyToClipboard, useTeacherHeader } from '../../../shared';
import styles from '../../../modules/classes/ui/Classes.module.css';

export function ClassesPage() {
  useTeacherHeader({ title: 'Мої класи' });
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, error } = useGetClassroomsQuery();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPendingInvitationsOpen, setIsPendingInvitationsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  // Open invitations modal if inviteToken in search params or user clicks banner
  useEffect(() => {
    if (searchParams.get('inviteToken')) {
      setIsPendingInvitationsOpen(true);
      // Clean up param
      searchParams.delete('inviteToken');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCopyCode = async (e: MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

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
    <div className={styles['classes-container']}>
      {/* Pending Invitations Banner */}
      <CourseInvitationsBanner
        count={pendingCount}
        onOpenModal={() => setIsPendingInvitationsOpen(true)}
      />

      <div className={styles['classes-header']}>
        <div>
          <h1 className={styles['classes-title']}>
            Мої класи
            <span className={styles['badge-limit']}>
              {limits.currentActiveClasses} / {limits.maxClasses} класів
            </span>
          </h1>
          <p style={{ color: '#9090a8', margin: '6px 0 0 0', fontSize: '0.9rem' }}>
            Керуйте своїми класами, додавайте учнів та створюйте курси для тестувань
          </p>
        </div>

        {classrooms.length > 0 && (
          <button
            type="button"
            className={styles['btn-create-class']}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={limits.currentActiveClasses >= limits.maxClasses}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Створити клас
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9090a8' }}>
          Завантаження класів...
        </div>
      ) : error ? (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '16px', borderRadius: '12px' }}>
          Помилка завантаження списку класів. Спробуйте оновити сторінку.
        </div>
      ) : classrooms.length === 0 ? (
        <div
          style={{
            background: '#1a1a26',
            border: '1px dashed #2a2a3a',
            borderRadius: '16px',
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#606078" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <div>
            <h3 style={{ color: '#f0f0f5', margin: '0 0 6px 0', fontSize: '1.2rem' }}>У вас ще немає створених класів</h3>
            <p style={{ color: '#9090a8', margin: 0, fontSize: '0.9rem' }}>
              Створіть свій перший клас, додайте учнів та організовуйте курси
            </p>
          </div>
          <button
            type="button"
            className={styles['btn-create-class']}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Створити перший клас
          </button>
        </div>
      ) : (
        <div className={styles['classes-grid']}>
          {classrooms.map((c) => {
            const studentCount = c._count?.students || 0;
            const coursesCount = c._count?.courses || 0;

            return (
              <Link key={c.uuid} to={`/classes/${c.uuid}`} className={styles['class-card']}>
                <div className={styles['class-card-header']}>
                  <h3 className={styles['class-name']}>{c.name}</h3>
                  {c.code && (
                    <button
                      type="button"
                      className={styles['class-code-badge']}
                      onClick={(e) => handleCopyCode(e, c.code!)}
                      title="Скопіювати код класу"
                    >
                      <span>{c.code}</span>
                      {copiedCode === c.code ? (
                        <CheckIcon size={14} style={{ color: '#22c55e' }} />
                      ) : (
                        <CopyIcon size={14} />
                      )}
                    </button>
                  )}
                </div>

                <div className={styles['class-stats-row']}>
                  <div className={styles['class-stat-item']}>
                    <span className={styles['class-stat-label']}>Учнів</span>
                    <span className={styles['class-stat-value']}>
                      {studentCount} <span style={{ fontSize: '0.8rem', color: '#606078' }}>/ 50</span>
                    </span>
                  </div>
                  <div className={styles['class-stat-item']}>
                    <span className={styles['class-stat-label']}>Курсів</span>
                    <span className={styles['class-stat-value']}>
                      {coursesCount} <span style={{ fontSize: '0.8rem', color: '#606078' }}>/ 15</span>
                    </span>
                  </div>
                </div>

                <div className={styles['class-footer-link']}>
                  <span>Переглянути клас</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Section: Courses assigned to this teacher */}
      {assignedCourses.length > 0 && (
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Курси під моїм керівництвом
            </h2>
            <p style={{ color: '#9090a8', margin: '4px 0 0 0', fontSize: '0.875rem' }}>
              Курси в інших класах, де вас призначено ведучим викладачем
            </p>
          </div>

          <div className={styles['classes-grid']}>
            {assignedCourses.map((course) => (
              <AssignedCourseCard
                key={course.uuid}
                course={course}
                onLeaveCourse={handleOpenLeaveCourse}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
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
};
