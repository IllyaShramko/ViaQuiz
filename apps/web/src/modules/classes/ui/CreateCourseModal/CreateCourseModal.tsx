import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from '../../../../shared';
import { useCreateCourseMutation } from '../../api/classesApi';
import {
  createCourseSchema,
  type CreateCourseFormData,
  type CreateCourseFormProps,
  type CreateCourseModalProps,
} from './CreateCourseModal.types';
import styles from './CreateCourseModal.module.css';

function CreateCourseForm({
  formId,
  students,
  currentClassCourses,
  maxClassCourses,
  isCourseLimitReached,
  isLoading,
  errorMessage,
  onSubmitForm,
}: CreateCourseFormProps) {
  const [search, setSearch] = useState('');

  const courseNameId = useId();
  const courseNameErrorId = useId();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: '',
      studentUuids: [],
    },
  });

  const selectedUuids = useWatch({
    control,
    name: 'studentUuids',
    defaultValue: [],
  });

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
      setValue(
        'studentUuids',
        students.slice(0, 50).map((s) => s.uuid),
        { shouldValidate: true },
      );
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmitForm)} className={styles.form} noValidate>
      <div className={styles.limitCard}>
        <span className={styles.limitLabel}>Курсів у цьому класі:</span>
        <span
          className={`${styles.limitValue} ${
            isCourseLimitReached ? styles.limitValueReached : styles.limitValueOk
          }`}
        >
          {currentClassCourses} / {maxClassCourses}
        </span>
      </div>

      {isCourseLimitReached && (
        <div className={styles.errorBanner} role="alert">
          Досягнуто ліміту в {maxClassCourses} курсів для одного класу.
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          {errorMessage}
        </div>
      )}

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor={courseNameId}>
          Назва курсу / предмета *
        </label>
        <input
          id={courseNameId}
          type="text"
          disabled={isCourseLimitReached || isLoading}
          placeholder="наприклад, Алгебра, Геометрія, Англійська мова"
          className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? courseNameErrorId : undefined}
          autoFocus={!isCourseLimitReached}
          {...register('name')}
        />
        {errors.name && (
          <p id={courseNameErrorId} className={styles.fieldError} role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <span className={styles.formLabel}>
            Зарахувати учнів до курсу ({selectedUuids.length} / 50)
          </span>
          {students.length > 0 && (
            <button
              type="button"
              className={styles.selectAllBtn}
              onClick={handleSelectAll}
              disabled={isLoading}
            >
              {selectedUuids.length === students.length ? 'Зняти виділення' : 'Вибрати всіх'}
            </button>
          )}
        </div>

        {students.length > 5 && (
          <input
            type="text"
            placeholder="Пошук учня..."
            aria-label="Пошук учня"
            className={`${styles.formInput} ${styles.searchInput}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
          />
        )}

        <div className={styles.studentList}>
          {students.length === 0 ? (
            <div className={styles.emptyList}>
              У цьому класі ще немає зареєстрованих учнів
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className={styles.emptyList}>Учнів не знайдено за пошуком</div>
          ) : (
            filteredStudents.map((s) => {
              const isChecked = selectedUuids.includes(s.uuid);
              return (
                <label
                  key={s.uuid}
                  className={`${styles.studentRow} ${
                    isChecked ? styles.studentRowSelected : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    className={styles.studentCheckbox}
                    checked={isChecked}
                    onChange={() => handleToggleStudent(s.uuid)}
                    disabled={isLoading}
                  />
                  <span className={styles.studentName}>
                    {s.lastName} {s.firstName}{' '}
                    <span className={styles.studentLogin}>({s.login})</span>
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>
    </form>
  );
}

export function CreateCourseModal({
  classUuid,
  isOpen,
  onClose,
  students,
  currentClassCourses,
  maxClassCourses,
}: CreateCourseModalProps) {
  const [createCourse, { isLoading, error, reset: resetMutation }] =
    useCreateCourseMutation();
  const formId = useId();

  const isCourseLimitReached = currentClassCourses >= maxClassCourses;

  const handleSubmitForm = async (data: CreateCourseFormData) => {
    if (isCourseLimitReached) return;

    try {
      await createCourse({
        classUuid,
        body: {
          name: data.name.trim(),
          studentUuids: data.studentUuids,
        },
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
        ? 'Не вдалося створити курс'
        : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={resetMutation}
      size="lg"
      title="Створити курс для класу"
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
            disabled={isLoading || isCourseLimitReached}
          >
            {isLoading ? 'Створення...' : 'Створити курс'}
          </Button>
        </>
      }
    >
      <CreateCourseForm
        formId={formId}
        students={students}
        currentClassCourses={currentClassCourses}
        maxClassCourses={maxClassCourses}
        isCourseLimitReached={isCourseLimitReached}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmitForm={handleSubmitForm}
      />
    </Modal>
  );
}
