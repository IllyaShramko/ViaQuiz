import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCourseMutation } from '../../api/classesApi';
import {
  createCourseSchema,
  type CreateCourseFormData,
  type CreateCourseModalProps,
} from './CreateCourseModal.types';
import styles from '../AddStudentModal/AddStudentModal.module.css';

export function CreateCourseModal({
  classUuid,
  isOpen,
  onClose,
  students,
  currentClassCourses,
  maxClassCourses,
}: CreateCourseModalProps) {
  const [search, setSearch] = useState('');

  const [createCourse, { isLoading, error }] = useCreateCourseMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: '',
      studentUuids: [],
    },
  });

  if (!isOpen) return null;

  const watchedName = watch('name');
  const selectedUuids = watch('studentUuids') || [];
  const isCourseLimitReached = currentClassCourses >= maxClassCourses;

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName} ${s.login}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const handleToggleStudent = (uuid: string) => {
    if (selectedUuids.includes(uuid)) {
      setValue(
        'studentUuids',
        selectedUuids.filter((id) => id !== uuid),
        { shouldValidate: true },
      );
      return;
    }
    if (selectedUuids.length >= 50) {
      return;
    }
    setValue('studentUuids', [...selectedUuids, uuid], { shouldValidate: true });
  };

  const handleSelectAll = () => {
    if (selectedUuids.length === students.length) {
      setValue('studentUuids', [], { shouldValidate: true });
    } else {
      setValue('studentUuids', students.slice(0, 50).map((s) => s.uuid), { shouldValidate: true });
    }
  };

  const handleClose = () => {
    reset();
    setSearch('');
    onClose();
  };

  const onSubmit = async (data: CreateCourseFormData) => {
    if (isCourseLimitReached) return;

    try {
      await createCourse({
        classUuid,
        body: {
          name: data.name.trim(),
          studentUuids: data.studentUuids,
        },
      }).unwrap();

      reset();
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
      ? 'Не вдалося створити курс'
      : null;

  return (
    <div className={styles['modal-backdrop']} onClick={handleClose}>
      <div className={styles['modal-content']} style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>Створити курс для класу</h2>
          <button
            type="button"
            className={styles['modal-close-btn']}
            onClick={handleClose}
            aria-label="Закрити"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles['modal-body']}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a26', padding: '10px 14px', borderRadius: '10px', border: '1px solid #2a2a3a' }}>
              <span style={{ fontSize: '0.85rem', color: '#9090a8' }}>Курсів у цьому класі:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isCourseLimitReached ? '#ef4444' : '#22c55e' }}>
                {currentClassCourses} / {maxClassCourses}
              </span>
            </div>

            {isCourseLimitReached && (
              <div className={styles['error-banner']}>
                Досягнуто ліміту в {maxClassCourses} курсів для одного класу.
              </div>
            )}

            {errorMessage && <div className={styles['error-banner']}>{errorMessage}</div>}

            <div className={styles['form-group']}>
              <label className={styles['form-label']} htmlFor="course-name">
                Назва курсу / предмета *
              </label>
              <input
                id="course-name"
                type="text"
                disabled={isCourseLimitReached}
                placeholder="наприклад, Алгебра, Геометрія, Англійська мова"
                className={`${styles['form-input']} ${errors.name ? styles['input--error'] : ''}`}
                {...register('name')}
              />
              {errors.name && (
                <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className={styles['form-group']}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className={styles['form-label']} style={{ margin: 0 }}>
                  Зарахувати учнів до курсу ({selectedUuids.length} / 50)
                </label>
                {students.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    style={{ background: 'transparent', border: 'none', color: '#863bff', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {selectedUuids.length === students.length ? 'Зняти виділення' : 'Вибрати всіх'}
                  </button>
                )}
              </div>

              {students.length > 5 && (
                <input
                  type="text"
                  placeholder="Пошук учня..."
                  className={styles['form-input']}
                  style={{ marginBottom: 8, padding: '6px 12px', fontSize: '0.88rem' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              )}

              <div
                style={{
                  maxHeight: '180px',
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
                {students.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#606078', fontSize: '0.85rem' }}>
                    У цьому класі ще немає зареєстрованих учнів
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#606078', fontSize: '0.85rem' }}>
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
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: isChecked ? 'rgba(134, 59, 255, 0.12)' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: '#f0f0f5',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleStudent(s.uuid)}
                          style={{ accentColor: '#863bff', width: '16px', height: '16px' }}
                        />
                        <span>
                          {s.lastName} {s.firstName} <span style={{ color: '#9090a8', fontSize: '0.8rem' }}>({s.login})</span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className={styles['modal-footer']}>
            <button type="button" className={styles['btn-secondary']} onClick={handleClose}>
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading || isCourseLimitReached || !watchedName?.trim()}
              className={styles['btn-primary']}
            >
              {isLoading ? 'Створення...' : 'Створити курс'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
