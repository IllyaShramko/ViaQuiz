import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetCourseQuery,
  useGetClassroomQuery,
  EnrollCourseStudentsModal,
  CourseHeader,
  CourseTabs,
  CourseStudentsTab,
  CoursePerformanceTab,
  CourseHistoryTab,
  type CourseTabType,
} from '../../../modules/classes';
import styles from '../../../modules/classes/ui/Classes.module.css';

export function CourseDetailsPage() {
  const { classUuid, courseUuid } = useParams<{ classUuid: string; courseUuid: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CourseTabType>('students');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const {
    data: course,
    isLoading: isCourseLoading,
    error: courseError,
  } = useGetCourseQuery(
    { classUuid: classUuid || '', courseUuid: courseUuid || '' },
    { skip: !classUuid || !courseUuid },
  );

  const { data: classroom } = useGetClassroomQuery(classUuid || '', {
    skip: !classUuid,
  });

  if (isCourseLoading) {
    return (
      <div className={styles['classes-container']}>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9090a8' }}>
          Завантаження даних курсу...
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className={styles['classes-container']}>
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '20px',
            borderRadius: '12px',
          }}
        >
          Курс не знайдено або сталася помилка.
          <br />
          <button
            type="button"
            onClick={() => navigate(classUuid ? `/classes/${classUuid}` : '/classes')}
            className={styles['btn-secondary']}
            style={{ marginTop: '12px' }}
          >
            ← Повернутися до класу
          </button>
        </div>
      </div>
    );
  }

  const courseStudents = course.students || [];
  const classroomStudents = classroom?.students || [];
  const className = course.classroom?.name || classroom?.name || 'Клас';

  return (
    <div className={styles['classes-container']}>
      <CourseHeader
        name={course.name}
        studentsCount={courseStudents.length}
        maxStudents={50}
      />

      <CourseTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentsCount={courseStudents.length}
        onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
        maxStudents={50}
      />

      {activeTab === 'students' && (
        <CourseStudentsTab
          classUuid={classUuid!}
          courseUuid={courseUuid!}
          className={className}
          students={courseStudents}
          onOpenEnrollModal={() => setIsEnrollModalOpen(true)}
        />
      )}

      {activeTab === 'performance' && <CoursePerformanceTab />}

      {activeTab === 'history' && <CourseHistoryTab courseUuid={course.uuid} />}

      <EnrollCourseStudentsModal
        classUuid={classUuid!}
        courseUuid={courseUuid!}
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        classroomStudents={classroomStudents}
        alreadyEnrolledUuids={courseStudents.map((s) => s.uuid)}
        maxCourseStudents={50}
      />
    </div>
  );
}
