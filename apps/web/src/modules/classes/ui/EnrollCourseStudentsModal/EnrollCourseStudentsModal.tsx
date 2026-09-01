import { useState, type FormEvent } from 'react';
import { useEnrollStudentsToCourseMutation } from '../../api/classesApi';
import type { StudentDto } from '@viaquiz/shared-types';
import styles from '../AddStudentModal/AddStudentModal.module.css';

interface EnrollCourseStudentsModalProps {
  classUuid: string;
  courseUuid: string;
  isOpen: boolean;
  onClose: () => void;
  classroomStudents: StudentDto[];
  alreadyEnrolledUuids: string[];
  maxCourseStudents?: number;
}

export function EnrollCourseStudentsModal({
  classUuid,
  courseUuid,
  isOpen,
  onClose,
  classroomStudents,
  alreadyEnrolledUuids,
  maxCourseStudents = 50,
}: EnrollCourseStudentsModalProps) {
  const [search, setSearch] = useState('');
  const [selectedUuids, setSelectedUuids] = useState<string[]>([]);

  const [enrollStudents, { isLoading, error }] = useEnrollStudentsToCourseMutation();

  if (!isOpen) return null;

  const currentEnrolledCount = alreadyEnrolledUuids.length;
  const availableSlots = Math.max(0, maxCourseStudents - currentEnrolledCount);

  // Available students from class who are not yet enrolled in this course
  const availableStudents = classroomStudents.filter(
    (s) => !alreadyEnrolledUuids.includes(s.uuid),
  );

  const filteredStudents = availableStudents.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName} ${s.login}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const handleToggleStudent = (uuid: string) => {
    setSelectedUuids((prev) => {
      if (prev.includes(uuid)) {
        return prev.filter((id) => id !== uuid);
      }
      if (prev.length >= availableSlots) {
        return prev;
      }
      return [...prev, uuid];
    });
  };

  const handleSelectAll = () => {
    if (selectedUuids.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedUuids([]);
    } else {
      setSelectedUuids(filteredStudents.slice(0, availableSlots).map((s) => s.uuid));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedUuids.length === 0) return;

    try {
      await enrollStudents({
        classUuid,
        courseUuid,
        studentUuids: selectedUuids,
      }).unwrap();

      setSelectedUuids([]);
      setSearch('');
      onClose();
    } catch {
      // Handled by RTK Query error
    }
  };

  const errorMessage =
    error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : error
      ? 'Не вдалося зарахувати учнів до курсу'
      : null;

  return (
    <div className={styles['modal-backdrop']} onClick={onClose}>
      <div
        className={styles['modal-content']}
        style={{ maxWidth: 560 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>Зарахувати учнів до курсу</h2>
          <button
            type="button"
            className={styles['modal-close-btn']}
            onClick={onClose}
            aria-label="Закрити"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles['modal-body']}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#1a1a26',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #2a2a3a',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#9090a8' }}>
                Зараховано / Ліміт курсу:
              </span>
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: availableSlots <= 0 ? '#ef4444' : '#22c55e',
                }}
              >
                {currentEnrolledCount} / {maxCourseStudents}
              </span>
            </div>

            {availableSlots <= 0 && (
              <div className={styles['error-banner']}>
                У курсі досягнуто максимального ліміту в {maxCourseStudents} учнів.
              </div>
            )}

            {errorMessage && <div className={styles['error-banner']}>{errorMessage}</div>}

            <div className={styles['form-group']}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <label className={styles['form-label']} style={{ margin: 0 }}>
                  Учні класу, доступні для зарахування ({selectedUuids.length} обрано)
                </label>
                {filteredStudents.length > 0 && availableSlots > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#863bff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {selectedUuids.length === filteredStudents.length
                      ? 'Зняти виділення'
                      : 'Вибрати всіх'}
                  </button>
                )}
              </div>

              {availableStudents.length > 5 && (
                <input
                  type="text"
                  placeholder="Пошук учня за ім'ям або логіном..."
                  className={styles['form-input']}
                  style={{ marginBottom: 8, padding: '6px 12px', fontSize: '0.88rem' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              )}

              <div
                style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  background: '#1a1a26',
                  border: '1px solid #2a2a3a',
                  borderRadius: '10px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {classroomStudents.length === 0 ? (
                  <div
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#606078',
                      fontSize: '0.85rem',
                    }}
                  >
                    У класі ще немає зареєстрованих учнів
                  </div>
                ) : availableStudents.length === 0 ? (
                  <div
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#606078',
                      fontSize: '0.85rem',
                    }}
                  >
                    Всі учні цього класу вже зараховані до цього курсу
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#606078',
                      fontSize: '0.85rem',
                    }}
                  >
                    Учнів не знайдено за пошуком
                  </div>
                ) : (
                  filteredStudents.map((s) => {
                    const isChecked = selectedUuids.includes(s.uuid);
                    return (
                      <label
                        key={s.uuid}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: isChecked ? 'rgba(134, 59, 255, 0.12)' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: '#f0f0f5',
                          transition: 'background 0.15s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudent(s.uuid)}
                          disabled={!isChecked && selectedUuids.length >= availableSlots}
                          style={{ accentColor: '#863bff', width: '16px', height: '16px' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>
                            {s.lastName} {s.firstName}
                          </span>
                          <span style={{ color: '#9090a8', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                            {s.login}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className={styles['modal-footer']}>
            <button type="button" className={styles['btn-secondary']} onClick={onClose}>
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading || availableSlots <= 0 || selectedUuids.length === 0}
              className={styles['btn-primary']}
            >
              {isLoading
                ? 'Зарахування...'
                : `Зарахувати до курсу ${selectedUuids.length > 0 ? `(${selectedUuids.length})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
