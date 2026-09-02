import { useState, type FormEvent } from 'react';
import { useInviteTeacherMutation } from '../../api/classesApi';
import type { InviteTeacherModalProps } from './InviteTeacherModal.types';
import styles from './InviteTeacherModal.module.css';

export function InviteTeacherModal({
  isOpen,
  onClose,
  classUuid,
  courseUuid,
  courseName,
}: InviteTeacherModalProps) {
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [inviteTeacher, { isLoading }] = useInviteTeacherMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setErrorMessage(null);
    try {
      await inviteTeacher({
        classUuid,
        courseUuid,
        search: search.trim(),
      }).unwrap();

      setSearch('');
      onClose();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setErrorMessage(e.data?.message || 'Не вдалося надіслати запрошення');
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Призначити викладача</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
              autoFocus
              required
            />
          </div>

          {errorMessage && <p className={styles.error}>{errorMessage}</p>}

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
              Скасувати
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading || !search.trim()}
            >
              {isLoading ? 'Надсилання...' : 'Надіслати запрошення'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
