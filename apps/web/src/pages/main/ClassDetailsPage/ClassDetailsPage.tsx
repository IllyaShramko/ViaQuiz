import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetClassroomQuery,
  useDeleteStudentMutation,
  AddStudentModal,
  ResetPasswordModal,
  CreateCourseModal,
  ClassTabs,
  ClassStudentsTab,
  ClassCoursesTab,
  ClassPerformanceTab,
  type ClassTabType,
} from '../../../modules/classes';
import { SessionsHistoryTable } from '../../../modules/reports';
import { useTeacherHeader } from '../../../shared';
import styles from './ClassDetailsPage.module.css';

const MAX_STUDENTS_PER_CLASS = 50;
const MAX_COURSES_PER_CLASS = 15;

export function ClassDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ClassTabType>('students');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ uuid: string; name: string } | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const { data: classroom, isLoading, error } = useGetClassroomQuery(uuid || '', {
    skip: !uuid,
  });

  useTeacherHeader(
    {
      title: classroom?.name || 'Клас',
      showBack: true,
      backTo: '/classes',
      backLabel: 'Назад до списку класів',
    },
    [classroom?.name],
  );

  const [deleteStudent] = useDeleteStudentMutation();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>Завантаження даних класу...</div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBanner}>
          <span>Клас не знайдено або сталася помилка.</span>
          <button
            type="button"
            onClick={() => navigate('/classes')}
            className={styles.backButton}
          >
            ← Повернутися до списку класів
          </button>
        </div>
      </div>
    );
  }

  const students = classroom.students || [];
  const courses = classroom.courses || [];

  const handleDeleteStudent = async (studentUuid: string, studentName: string) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити учня "${studentName}" з класу?`)) {
      return;
    }

    try {
      await deleteStudent({
        classUuid: classroom.uuid,
        studentUuid,
      }).unwrap();
    } catch {
      alert('Помилка при видаленні учня');
    }
  };

  return (
    <div className={styles.container}>
      <ClassTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentsCount={students.length}
        coursesCount={courses.length}
        maxStudents={MAX_STUDENTS_PER_CLASS}
        maxCourses={MAX_COURSES_PER_CLASS}
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
        onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
      />

      {activeTab === 'students' && (
        <ClassStudentsTab
          classUuid={classroom.uuid}
          students={students}
          maxStudents={MAX_STUDENTS_PER_CLASS}
          onOpenAddStudent={() => setIsAddStudentOpen(true)}
          onResetPassword={(target) => {
            setResetTarget(target);
            setIsResetModalOpen(true);
          }}
          onDeleteStudent={handleDeleteStudent}
        />
      )}

      {activeTab === 'courses' && (
        <ClassCoursesTab
          classUuid={classroom.uuid}
          courses={courses}
          maxStudentsPerCourse={MAX_STUDENTS_PER_CLASS}
          onOpenCreateCourse={() => setIsCreateCourseOpen(true)}
        />
      )}

      {activeTab === 'performance' && (
        <ClassPerformanceTab classUuid={classroom.uuid} />
      )}

      {activeTab === 'history' && (
        <SessionsHistoryTable
          classUuid={classroom.uuid}
          searchPlaceholder="Пошук тестувань класу..."
        />
      )}

      <AddStudentModal
        classUuid={classroom.uuid}
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      <CreateCourseModal
        classUuid={classroom.uuid}
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        students={students}
        currentClassCourses={courses.length}
        maxClassCourses={MAX_COURSES_PER_CLASS}
      />

      <ResetPasswordModal
        classUuid={classroom.uuid}
        studentUuid={resetTarget?.uuid ?? ''}
        studentName={resetTarget?.name ?? ''}
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onAfterClose={() => setResetTarget(null)}
      />
    </div>
  );
}
