import { Link } from 'react-router-dom';
import { useUnenrollStudentFromCourseMutation } from '../../../api/classesApi';
import type { CourseStudentsTabProps } from './CourseStudentsTab.types';
import styles from '../../Classes.module.css';

export function CourseStudentsTab({
  classUuid,
  courseUuid,
  className = 'Клас',
  students,
  onOpenEnrollModal,
}: CourseStudentsTabProps) {
  const [unenrollStudent, { isLoading: isUnenrolling }] = useUnenrollStudentFromCourseMutation();

  const handleUnenroll = async (studentUuid: string, studentName: string) => {
    if (
      !window.confirm(
        `Ви впевнені, що хочете відрахувати учня "${studentName}" з цього курсу? (Учень залишиться у класі)`,
      )
    ) {
      return;
    }

    try {
      await unenrollStudent({
        classUuid,
        courseUuid,
        studentUuid,
      }).unwrap();
    } catch {
      alert('Помилка при відрахуванні учня з курсу');
    }
  };

  if (students.length === 0) {
    return (
      <div className={styles['empty-state']}>
        <div className={styles['empty-icon']}>👥</div>
        <p>У цьому курсі ще немає зарахованих учнів.</p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={onOpenEnrollModal}
          style={{ marginTop: '1rem' }}
        >
          Зарахувати учнів із {className}
        </button>
      </div>
    );
  }

  return (
    <div className={styles['students-table-wrapper']}>
      <table className={styles['students-table']}>
        <thead>
          <tr>
            <th>#</th>
            <th>Ім'я учня</th>
            <th>Логін</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => {
            const studentDisplayName =
              student.firstName && student.lastName
                ? `${student.firstName} ${student.lastName}`
                : student.login;

            return (
              <tr key={student.uuid}>
                <td>{idx + 1}</td>
                <td className={styles['student-name-cell']}>
                  <Link
                    to={`/classes/${classUuid}/students/${student.uuid}`}
                    className={styles['student-link']}
                  >
                    {studentDisplayName}
                  </Link>
                </td>
                <td className={styles['student-login-cell']}>
                  <code>{student.login}</code>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles['btn-action-delete']}
                    onClick={() => handleUnenroll(student.uuid, studentDisplayName)}
                    disabled={isUnenrolling}
                    title="Відрахувати з курсу"
                  >
                    Відрахувати
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
