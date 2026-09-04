import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useInviteTeacherMutation } from '../../api/classesApi';
import {
  inviteTeacherSchema,
  type InviteTeacherFormData,
  type InviteTeacherModalProps,
} from './InviteTeacherModal.types';
import styles from './InviteTeacherModal.module.css';

export function InviteTeacherModal({
  isOpen,
  onClose,
  classUuid,
  courseUuid,
  courseName,
}: InviteTeacherModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inviteTeacher, { isLoading }] = useInviteTeacherMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<InviteTeacherFormData>({
    resolver: zodResolver(inviteTeacherSchema),
    defaultValues: {
      search: '',
    },
  });

  if (!isOpen) return null;

  const watchedSearch = watch('search');

  const handleClose = () => {
    reset();
    setErrorMessage(null);
    onClose();
  };

  const onSubmit = async (data: InviteTeacherFormData) => {
    setErrorMessage(null);
    try {
      await inviteTeacher({
        classUuid,
        courseUuid,
        search: data.search.trim(),
      }).unwrap();

      reset();
      onClose();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setErrorMessage(e.data?.message || 'Не вдалося надіслати запрошення');
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Призначити викладача</h2>
          <button type="button" className={styles.closeButton} onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <p className={styles.description}>
            Запросіть викладача керувати курсом <strong>«{courseName}»</strong>. Він зможе проводити тестування, керувати учнями та переглядати результати.
          </p>

          <div className={styles.infoBox}>
            ✉️ Запрошення буде надіслано на email або надійде у кабінет викладача. Якщо користувач ще не зареєстрований, він отримає посилання для реєстрації.
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="teacherSearch">
              Логін або Email викладача
            </label>
            <input
              id="teacherSearch"
              type="text"
              className={styles.input}
              placeholder="Наприклад: teacher_oleg або oleg@school.ua"
              disabled={isLoading}
              autoFocus
              {...register('search')}
            />
            {errors.search && <p className={styles.error}>{errors.search.message}</p>}
          </div>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={handleClose} disabled={isLoading}>
              Скасувати
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading || !watchedSearch?.trim()}
            >
              {isLoading ? 'Надсилання...' : 'Надіслати запрошення'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
