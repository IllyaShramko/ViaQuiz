import { Link } from 'react-router-dom';
import { useUnenrollStudentFromCourseMutation } from '../../api/classesApi';
import type { StudentDto } from '@viaquiz/shared-types';
import styles from '../Classes.module.css';

interface CourseStudentsTabProps {
  classUuid: string;
  courseUuid: string;
  className?: string;
  students: StudentDto[];
  onOpenEnrollModal: () => void;
}

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
      <div className={styles['students-table-card']}>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9090a8' }}>
          <p style={{ fontSize: '1.05rem', margin: '0 0 14px 0', color: '#f0f0f5' }}>
            У цьому курсі ще немає зарахованих учнів
          </p>
          <p style={{ fontSize: '0.9rem', margin: '0 0 20px 0', color: '#9090a8' }}>
            Зарахуйте учнів із зареєстрованого списку класу «{className}»
          </p>
          <button
            type="button"
            className={styles['btn-create-class']}
            style={{ margin: '0 auto' }}
            onClick={onOpenEnrollModal}
          >
            + Зарахувати перших учнів
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['students-table-card']}>
      <table className={styles['students-table']}>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>№</th>
            <th>Прізвище Ім'я</th>
            <th>Логін</th>
            <th>Пройдено тестів</th>
            <th style={{ textAlign: 'right' }}>Дії</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, index) => (
            <tr key={s.uuid}>
              <td style={{ color: '#9090a8', fontWeight: 600 }}>{index + 1}</td>
              <td>
                <Link
                  to={`/classes/${classUuid}/students/${s.uuid}`}
                  className={styles['student-link']}
                >
                  <div className={styles['student-avatar']}>
                    {s.lastName[0]}
                    {s.firstName[0]}
                  </div>
                  <span>
                    {s.lastName} {s.firstName}
                  </span>
                </Link>
              </td>
              <td>
                <span style={{ fontFamily: 'monospace', color: '#9090a8', fontSize: '0.9rem' }}>
                  {s.login}
                </span>
              </td>
              <td>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>
                  {s._count?.passedQuizes || 0}
                </span>
              </td>
              <td>
                <div className={styles['table-actions']}>
                  <Link
                    to={`/classes/${classUuid}/students/${s.uuid}`}
                    className={styles['action-icon-btn']}
                    title="Переглянути результати та аналітику"
                  >
                    Аналітика
                  </Link>
                  <button
                    type="button"
                    className={`${styles['action-icon-btn']} ${styles['danger']}`}
                    onClick={() => handleUnenroll(s.uuid, `${s.lastName} ${s.firstName}`)}
                    disabled={isUnenrolling}
                    title="Відрахувати учня з цього курсу"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="18" y1="8" x2="23" y2="13" />
                      <line x1="23" y1="8" x2="18" y2="13" />
                    </svg>
                    Відрахувати
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
