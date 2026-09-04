import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetStudentClassroomQuery, ClassmateCard } from '../../../modules/students';
import styles from './StudentClassPage.module.css';

export function StudentClassPage() {
  const navigate = useNavigate();
  const { data: classroom, isLoading, error } = useGetStudentClassroomQuery();
  const [searchQuery, setSearchQuery] = useState('');

  const classmates = classroom?.classmates || [];
  const courses = classroom?.courses || [];
  const teacher = classroom?.teacher;

  const filteredClassmates = useMemo(() => {
    if (!searchQuery.trim()) return classmates;
    const query = searchQuery.trim().toLowerCase();
    return classmates.filter((c) => {
      const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [classmates, searchQuery]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles['loading-state']}>
          Завантаження інформації про клас...
        </div>
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className={styles.container}>
        <div className={styles['empty-state']}>
          Не вдалося завантажити дані класу. Будь ласка, спробуйте пізніше.
        </div>
      </div>
    );
  }

  const teacherName = teacher
    ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Вчитель'
    : 'Вчитель';

  return (
    <div className={styles.container}>
      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles['banner-info']}>
          <h2 className={styles.title}>Клас: {classroom.name}</h2>
          <p className={styles.subtitle}>
            Вчитель: <strong>{teacherName}</strong> • Однокласників: <strong>{classmates.length}</strong>
          </p>
        </div>
        {classroom.code && (
          <div className={styles['banner-badge']}>
            Код класу: {classroom.code}
          </div>
        )}
      </div>

      {/* Classmates Section */}
      <div className={styles.section}>
        <div className={styles['section-header']}>
          <h3 className={styles['section-title']}>
            Однокласники
            <span className={styles['count-badge']}>{filteredClassmates.length}</span>
          </h3>
          {classmates.length > 5 && (
            <input
              type="text"
              placeholder="Пошук за ім'ям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles['search-input']}
            />
          )}
        </div>

        {filteredClassmates.length > 0 ? (
          <div className={styles['classmates-grid']}>
            {filteredClassmates.map((classmate) => (
              <ClassmateCard
                key={classmate.uuid}
                classmate={classmate}
                onClick={(uuid) => navigate(`/student/classmates/${uuid}`)}
              />
            ))}
          </div>
        ) : (
          <div className={styles['empty-state']}>
            {searchQuery
              ? 'Однокласників за таким запитом не знайдено'
              : 'У вашому класі ще немає інших учнів'}
          </div>
        )}
      </div>

      {/* Courses Section */}
      {courses.length > 0 && (
        <div className={styles.section}>
          <div className={styles['section-header']}>
            <h3 className={styles['section-title']}>
              Курси нашого класу
              <span className={styles['count-badge']}>{courses.length}</span>
            </h3>
          </div>
          <div className={styles['courses-grid']}>
            {courses.map((course) => (
              <div key={course.id} className={styles['course-card']}>
                <div>
                  <h4 className={styles['course-name']}>{course.name}</h4>
                  <p className={styles['course-meta']}>Активний курс</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
