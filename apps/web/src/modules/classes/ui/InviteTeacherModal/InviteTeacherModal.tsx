import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, MailIcon, Modal } from '../../../../shared';
import { useInviteTeacherMutation } from '../../api/classesApi';
import {
  inviteTeacherSchema,
  type InviteTeacherFormData,
  type InviteTeacherFormProps,
  type InviteTeacherModalProps,
} from './InviteTeacherModal.types';
import styles from './InviteTeacherModal.module.css';

function InviteTeacherForm({
  formId,
  courseName,
  isLoading,
  errorMessage,
  onSubmitForm,
}: InviteTeacherFormProps) {
  const inputId = useId();
  const errorId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteTeacherFormData>({
    resolver: zodResolver(inviteTeacherSchema),
    defaultValues: {
      search: '',
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmitForm)} className={styles.form} noValidate>
      <p className={styles.description}>
        Запросіть викладача керувати курсом <strong>«{courseName}»</strong>. Він зможе
        проводити тестування, керувати учнями та переглядати результати.
      </p>

      <div className={styles.infoBox}>
        <MailIcon size={16} className={styles.infoIcon} aria-hidden="true" />
        <span>
          Запрошення буде надіслано на email або надійде у кабінет викладача. Якщо користувач
          ще не зареєстрований, він отримає посилання для реєстрації.
        </span>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor={inputId}>
          Логін або Email викладача
        </label>
        <input
          id={inputId}
          type="text"
          className={`${styles.input} ${errors.search ? styles.inputError : ''}`}
          placeholder="Наприклад: teacher_oleg або oleg@school.ua"
          disabled={isLoading}
          aria-invalid={Boolean(errors.search)}
          aria-describedby={errors.search ? errorId : undefined}
          autoFocus
          {...register('search')}
        />
        {errors.search && (
          <p id={errorId} className={styles.error} role="alert">
            {errors.search.message}
          </p>
        )}
      </div>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

export function InviteTeacherModal({
  isOpen,
  onClose,
  classUuid,
  courseUuid,
  courseName,
}: InviteTeacherModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inviteTeacher, { isLoading }] = useInviteTeacherMutation();
  const formId = useId();

  const handleSubmitForm = async (data: InviteTeacherFormData) => {
    setErrorMessage(null);
    try {
      await inviteTeacher({
        classUuid,
        courseUuid,
        search: data.search.trim(),
      }).unwrap();

      onClose();
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string } };
      setErrorMessage(apiErr.data?.message || 'Не вдалося надіслати запрошення');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={() => setErrorMessage(null)}
      size="md"
      title="Призначити викладача"
      isBusy={isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Скасувати
          </Button>
          <Button type="submit" form={formId} variant="primary" disabled={isLoading}>
            {isLoading ? 'Надсилання...' : 'Надіслати запрошення'}
          </Button>
        </>
      }
    >
      <InviteTeacherForm
        formId={formId}
        courseName={courseName}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmitForm={handleSubmitForm}
      />
    </Modal>
  );
}
