import { Link } from 'react-router-dom';
import { useUnenrollStudentFromCourseMutation } from '../../../api/classesApi';
import type { CourseStudentsTabProps } from './CourseStudentsTab.types';
import styles from './CourseStudentsTab.module.css';

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

  const getInitials = (firstName?: string, lastName?: string, login?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    if (last || first) {
      return `${last}${first}`.toUpperCase();
    }
    return (login || '').slice(0, 2).toUpperCase();
  };

  const getDisplayName = (firstName?: string, lastName?: string, login?: string) => {
    if (lastName && firstName) {
      return `${lastName} ${firstName}`;
    }
    if (firstName) return firstName;
    if (lastName) return lastName;
    return login || '';
  };

  return (
    <div className={styles.studentsTableCard}>
      {students.length === 0 ? (
        <div className={styles.emptyCard}>
          <p className={styles.emptyText}>У цьому курсі ще немає зарахованих учнів</p>
          <button
            type="button"
            className={styles.btnEnroll}
            onClick={onOpenEnrollModal}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Зарахувати учнів із {className}
          </button>
        </div>
      ) : (
        <table className={styles.studentsTable}>
          <thead>
            <tr>
              <th className={styles.colNumber}>№</th>
              <th>Прізвище Ім'я</th>
              <th>Логін</th>
              <th>Пройдено тестів</th>
              <th style={{ textAlign: 'right' }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const displayName = getDisplayName(student.firstName, student.lastName, student.login);
              const initials = getInitials(student.firstName, student.lastName, student.login);

              return (
                <tr key={student.uuid}>
                  <td className={styles.studentNumber}>{idx + 1}</td>
                  <td>
                    <Link
                      to={`/classes/${classUuid}/students/${student.uuid}`}
                      className={styles.studentLink}
                    >
                      <div className={styles.studentAvatar}>
                        {initials}
                      </div>
                      <span>{displayName}</span>
                    </Link>
                  </td>
                  <td>
                    <span className={styles.studentLogin}>
                      {student.login}
                    </span>
                  </td>
                  <td>
                    <span className={styles.passedQuizes}>
                      {student._count?.passedQuizes || 0}
                    </span>
                  </td>
                  <td>
                    <div className={styles.tableActions}>
                      <Link
                        to={`/classes/${classUuid}/students/${student.uuid}`}
                        className={styles.actionIconBtn}
                        title="Переглянути результати та аналітику"
                      >
                        Аналітика
                      </Link>
                      <button
                        type="button"
                        className={`${styles.actionIconBtn} ${styles.danger}`}
                        onClick={() => handleUnenroll(student.uuid, displayName)}
                        disabled={isUnenrolling}
                        title="Відрахувати з курсу"
                      >
                        Відрахувати
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

