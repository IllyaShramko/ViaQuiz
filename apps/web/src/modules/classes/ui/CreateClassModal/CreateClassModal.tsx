import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from '../../../../shared';
import { useCreateClassroomMutation } from '../../api/classesApi';
import {
  createClassSchema,
  type CreateClassFormData,
  type CreateClassFormProps,
  type CreateClassModalProps,
} from './CreateClassModal.types';
import styles from './CreateClassModal.module.css';

function CreateClassForm({
  formId,
  currentActiveClasses,
  maxClasses,
  isLimitReached,
  isLoading,
  errorMessage,
  onSubmitForm,
}: CreateClassFormProps) {
  const inputId = useId();
  const errorId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmitForm)} className={styles.form} noValidate>
      <div className={styles.limitCard}>
        <span className={styles.limitLabel}>Активні класи:</span>
        <span
          className={`${styles.limitValue} ${
            isLimitReached ? styles.limitValueReached : styles.limitValueOk
          }`}
        >
          {currentActiveClasses} / {maxClasses}
        </span>
      </div>

      {isLimitReached && (
        <div className={styles.errorBanner} role="alert">
          Досягнуто ліміту в {maxClasses} активних класів. Архівуйте або видаліть
          непотрібний клас, щоб створити новий.
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          {errorMessage}
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor={inputId}>
          Назва класу / групи *
        </label>
        <input
          id={inputId}
          type="text"
          disabled={isLimitReached || isLoading}
          placeholder="наприклад, 9-А або Фізика-101"
          className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? errorId : undefined}
          autoFocus={!isLimitReached}
          {...register('name')}
        />
        {errors.name && (
          <p id={errorId} className={styles.fieldError} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>
    </form>
  );
}

export function CreateClassModal({
  isOpen,
  onClose,
  currentActiveClasses,
  maxClasses,
}: CreateClassModalProps) {
  const [createClassroom, { isLoading, error, reset: resetMutation }] =
    useCreateClassroomMutation();
  const formId = useId();

  const isLimitReached = currentActiveClasses >= maxClasses;

  const handleSubmitForm = async (data: CreateClassFormData) => {
    if (isLimitReached) return;

    try {
      await createClassroom({
        name: data.name.trim(),
      }).unwrap();

      onClose();
    } catch {
      // Handled by RTK Query error state
    }
  };

  const errorMessage =
    error &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data
      ? String(error.data.message)
      : error
        ? 'Не вдалося створити клас'
        : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={resetMutation}
      size="md"
      title="Створити новий клас"
      isBusy={isLoading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Скасувати
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            disabled={isLoading || isLimitReached}
          >
            {isLoading ? 'Створення...' : 'Створити клас'}
          </Button>
        </>
      }
    >
      <CreateClassForm
        formId={formId}
        currentActiveClasses={currentActiveClasses}
        maxClasses={maxClasses}
        isLimitReached={isLimitReached}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmitForm={handleSubmitForm}
      />
    </Modal>
  );
}
