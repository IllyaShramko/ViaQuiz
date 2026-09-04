import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateClassroomMutation } from '../../api/classesApi';
import {
  createClassSchema,
  type CreateClassFormData,
  type CreateClassModalProps,
} from './CreateClassModal.types';
import styles from '../AddStudentModal/AddStudentModal.module.css';

export function CreateClassModal({
  isOpen,
  onClose,
  currentActiveClasses,
  maxClasses,
}: CreateClassModalProps) {
  const [createClassroom, { isLoading, error }] = useCreateClassroomMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: '',
      code: '',
    },
  });

  if (!isOpen) return null;

  const isLimitReached = currentActiveClasses >= maxClasses;
  const watchedName = watch('name');

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: CreateClassFormData) => {
    if (isLimitReached) return;

    try {
      await createClassroom({
        name: data.name.trim(),
        code: data.code?.trim() || undefined,
      }).unwrap();

      reset();
      onClose();
    } catch {
      // Handled by RTK Query error
    }
  };

  const errorMessage =
    error && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : error
      ? 'Не вдалося створити клас'
      : null;

  return (
    <div className={styles['modal-backdrop']} onClick={handleClose}>
      <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>Створити новий клас</h2>
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
              <span style={{ fontSize: '0.85rem', color: '#9090a8' }}>Активні класи:</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isLimitReached ? '#ef4444' : '#22c55e' }}>
                {currentActiveClasses} / {maxClasses}
              </span>
            </div>

            {isLimitReached && (
              <div className={styles['error-banner']}>
                Досягнуто ліміту в {maxClasses} активних класів. Архівуйте або видаліть непотрібний клас, щоб створити новий.
              </div>
            )}

            {errorMessage && <div className={styles['error-banner']}>{errorMessage}</div>}

            <div className={styles['form-group']}>
              <label className={styles['form-label']} htmlFor="class-name">
                Назва класу / групи *
              </label>
              <input
                id="class-name"
                type="text"
                disabled={isLimitReached}
                placeholder="наприклад, 9-А або Фізика-101"
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
              <label className={styles['form-label']} htmlFor="class-code">
                Код класу (необов'язково)
              </label>
              <input
                id="class-code"
                type="text"
                disabled={isLimitReached}
                placeholder="Авто-генерація, якщо не вказано"
                className={`${styles['form-input']} ${errors.code ? styles['input--error'] : ''}`}
                {...register('code', {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  },
                })}
              />
              {errors.code && (
                <span style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                  {errors.code.message}
                </span>
              )}
              <span className={styles['hint-text']}>
                Унікальний код для швидкого пошуку або приєднання
              </span>
            </div>
          </div>

          <div className={styles['modal-footer']}>
            <button type="button" className={styles['btn-secondary']} onClick={handleClose}>
              Скасувати
            </button>
            <button
              type="submit"
              disabled={isLoading || isLimitReached || !watchedName?.trim()}
              className={styles['btn-primary']}
            >
              {isLoading ? 'Створення...' : 'Створити клас'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
