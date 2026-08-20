import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetClassroomQuery,
  useDeleteStudentMutation,
} from '../../../modules/classes/api/classesApi';
import { AddStudentModal } from '../../../modules/classes/ui/AddStudentModal/AddStudentModal';
import { ResetPasswordModal } from '../../../modules/classes/ui/ResetPasswordModal/ResetPasswordModal';
import { CreateCourseModal } from '../../../modules/classes/ui/CreateCourseModal/CreateCourseModal';
import styles from '../../../modules/classes/ui/Classes.module.css';

type TabType = 'students' | 'courses' | 'performance' | 'history';

export function ClassDetailsPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<{ uuid: string; name: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const { data: classroom, isLoading, error } = useGetClassroomQuery(uuid || '', {
    skip: !uuid,
  });

  const [deleteStudent] = useDeleteStudentMutation();

  if (isLoading) {
    return (
      <div className={styles['classes-container']}>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#9090a8' }}>
          Завантаження даних класу...
        </div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className={styles['classes-container']}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '20px', borderRadius: '12px' }}>
          Клас не знайдено або сталася помилка.
          <br />
          <button
            type="button"
            onClick={() => navigate('/classes')}
            className={styles['btn-secondary']}
            style={{ marginTop: '12px' }}
          >
            ← Повернутися до списку класів
          </button>
        </div>
      </div>
    );
  }

  const students = classroom.students || [];
  const courses = classroom.courses || [];

  const handleCopyCode = () => {
    if (!classroom.code) return;
    navigator.clipboard.writeText(classroom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
    <div className={styles['classes-container']}>
      {/* Detail Top Navigation */}
      <div className={styles['class-detail-nav']}>
        <div className={styles['class-tabs']}>
          <button
            type="button"
            className={`${styles['tab-btn']} ${activeTab === 'students' ? styles['is-active'] : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Учні ({students.length})
          </button>
          <button
            type="button"
            className={`${styles['tab-btn']} ${activeTab === 'courses' ? styles['is-active'] : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Курси ({courses.length})
          </button>
          <button
            type="button"
            className={`${styles['tab-btn']} ${activeTab === 'performance' ? styles['is-active'] : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Успішність
          </button>
          <button
            type="button"
            className={`${styles['tab-btn']} ${activeTab === 'history' ? styles['is-active'] : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Історія
          </button>
        </div>

        <div className={styles['class-actions-row']}>
          {activeTab === 'students' && students.length > 0 && (
            <button
              type="button"
              className={styles['btn-create-class']}
              onClick={() => setIsAddStudentOpen(true)}
              disabled={students.length >= 50}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Додати нового учня
            </button>
          )}

          {activeTab === 'courses' && courses.length > 0 && (
            <button
              type="button"
              className={styles['btn-create-class']}
              onClick={() => setIsCreateCourseOpen(true)}
              disabled={courses.length >= 15}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Створити курс
            </button>
          )}

          {classroom.code && (
            <button
              type="button"
              className={styles['action-icon-btn']}
              onClick={handleCopyCode}
              title="Скопіювати код класу"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copiedCode ? 'Код скопійовано!' : `Код: ${classroom.code}`}
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Students Table */}
      {activeTab === 'students' && (
        <div className={styles['students-table-card']}>
          {students.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9090a8' }}>
              <p style={{ fontSize: '1.05rem', margin: '0 0 14px 0' }}>У цьому класі ще немає зареєстрованих учнів</p>
              <button
                type="button"
                className={styles['btn-create-class']}
                style={{ margin: '0 auto' }}
                onClick={() => setIsAddStudentOpen(true)}
              >
                + Додати першого учня
              </button>
            </div>
          ) : (
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
                        to={`/classes/${classroom.uuid}/students/${s.uuid}`}
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
                          to={`/classes/${classroom.uuid}/students/${s.uuid}`}
                          className={styles['action-icon-btn']}
                          title="Переглянути результати та аналітику"
                        >
                          Аналітика
                        </Link>
                        <button
                          type="button"
                          className={styles['action-icon-btn']}
                          onClick={() => setResetTarget({ uuid: s.uuid, name: `${s.lastName} ${s.firstName}` })}
                          title="Скинути пароль"
                        >
                          Скинути пароль
                        </button>
                        <button
                          type="button"
                          className={`${styles['action-icon-btn']} ${styles['danger']}`}
                          onClick={() => handleDeleteStudent(s.uuid, `${s.lastName} ${s.firstName}`)}
                          title="Видалити учня"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Courses */}
      {activeTab === 'courses' && (
        <div>
          {courses.length === 0 ? (
            <div
              style={{
                background: '#1a1a26',
                border: '1px dashed #2a2a3a',
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#9090a8',
              }}
            >
              <h3 style={{ color: '#f0f0f5', margin: '0 0 8px 0' }}>Курсів ще не створено</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem' }}>
                Створюйте окремі курси (наприклад, Алгебра, Фізика) та зараховуйте учнів з цього класу
              </p>
              <button
                type="button"
                className={styles['btn-create-class']}
                style={{ margin: '0 auto' }}
                onClick={() => setIsCreateCourseOpen(true)}
              >
                + Створити курс
              </button>
            </div>
          ) : (
            <div className={styles['classes-grid']}>
              {courses.map((course) => (
                <div key={course.uuid} className={styles['class-card']}>
                  <div className={styles['class-card-header']}>
                    <h3 className={styles['class-name']}>{course.name}</h3>
                  </div>
                  <div className={styles['class-stats-row']}>
                    <div className={styles['class-stat-item']}>
                      <span className={styles['class-stat-label']}>Зараховано учнів</span>
                      <span className={styles['class-stat-value']}>
                        {course._count?.students || 0} <span style={{ fontSize: '0.8rem', color: '#606078' }}>/ 50</span>
                      </span>
                    </div>
                    <div className={styles['class-stat-item']}>
                      <span className={styles['class-stat-label']}>Сесій / ігор</span>
                      <span className={styles['class-stat-value']}>{course._count?.rooms || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Performance */}
      {activeTab === 'performance' && (
        <div style={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#9090a8' }}>
          <h3 style={{ color: '#f0f0f5', margin: '0 0 8px 0' }}>Зведена успішність класу</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Для перегляду детальної індивідуальної успішності та графіків перейдіть на сторінку конкретного учня у вкладці «Учні».
          </p>
        </div>
      )}

      {/* Tab 4: History */}
      {activeTab === 'history' && (
        <div style={{ background: '#1a1a26', border: '1px solid #2a2a3a', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#9090a8' }}>
          <h3 style={{ color: '#f0f0f5', margin: '0 0 8px 0' }}>Історія тестувань класу</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Тут відображаються завершені сесії вікторин, що проводилися для цього класу та його курсів.
          </p>
        </div>
      )}

      {/* Modals */}
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
        maxClassCourses={15}
      />

      {resetTarget && (
        <ResetPasswordModal
          classUuid={classroom.uuid}
          studentUuid={resetTarget.uuid}
          studentName={resetTarget.name}
          isOpen={Boolean(resetTarget)}
          onClose={() => setResetTarget(null)}
        />
      )}
    </div>
  );
};
