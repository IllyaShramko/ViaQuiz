import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Modal } from '../../../../shared';
import { useEnrollStudentsToCourseMutation } from '../../api/classesApi';
import {
  enrollCourseStudentsSchema,
  type EnrollCourseStudentsFormData,
  type EnrollCourseStudentsModalProps,
} from './EnrollCourseStudentsModal.types';
import styles from './EnrollCourseStudentsModal.module.css';

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
  const formId = useId();

  const [enrollStudents, { isLoading, error, reset: resetMutation }] =
    useEnrollStudentsToCourseMutation();

  const { handleSubmit, reset, control, setValue } =
    useForm<EnrollCourseStudentsFormData>({
      resolver: zodResolver(enrollCourseStudentsSchema),
      defaultValues: {
        studentUuids: [],
      },
    });

  const selectedUuids = useWatch({
    control,
    name: 'studentUuids',
    defaultValue: [],
  });
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
    if (selectedUuids.includes(uuid)) {
      setValue(
        'studentUuids',
        selectedUuids.filter((id) => id !== uuid),
        { shouldValidate: true },
      );
      return;
    }
    if (selectedUuids.length >= availableSlots) {
      return;
    }
    setValue('studentUuids', [...selectedUuids, uuid], { shouldValidate: true });
  };

  const handleSelectAll = () => {
    if (selectedUuids.length === filteredStudents.length && filteredStudents.length > 0) {
      setValue('studentUuids', [], { shouldValidate: true });
    } else {
      setValue(
        'studentUuids',
        filteredStudents.slice(0, availableSlots).map((s) => s.uuid),
        { shouldValidate: true },
      );
    }
  };

  const handleAfterClose = () => {
    reset();
    setSearch('');
    resetMutation();
  };

  const onSubmit = async (data: EnrollCourseStudentsFormData) => {
    try {
      await enrollStudents({
        classUuid,
        courseUuid,
        studentUuids: data.studentUuids,
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
        ? 'Не вдалося зарахувати учнів до курсу'
        : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={handleAfterClose}
      size="lg"
      title="Зарахувати учнів до курсу"
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
            disabled={isLoading || availableSlots <= 0 || selectedUuids.length === 0}
          >
            {isLoading
              ? 'Зарахування...'
              : `Зарахувати до курсу${selectedUuids.length > 0 ? ` (${selectedUuids.length})` : ''}`}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <div className={styles.limitCard}>
          <span className={styles.limitLabel}>Зараховано / Ліміт курсу:</span>
          <span
            className={`${styles.limitValue} ${
              availableSlots <= 0 ? styles.limitValueReached : styles.limitValueOk
            }`}
          >
            {currentEnrolledCount} / {maxCourseStudents}
          </span>
        </div>

        {availableSlots <= 0 && (
          <div className={styles.errorBanner} role="alert">
            У курсі досягнуто максимального ліміту в {maxCourseStudents} учнів.
          </div>
        )}

        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            {errorMessage}
          </div>
        )}

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <span className={styles.formLabel}>
              Учні класу, доступні для зарахування ({selectedUuids.length} обрано)
            </span>
            {filteredStudents.length > 0 && availableSlots > 0 && (
              <button
                type="button"
                className={styles.selectAllBtn}
                onClick={handleSelectAll}
                disabled={isLoading}
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
              aria-label="Пошук учня за ім'ям або логіном"
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={isLoading}
            />
          )}

          <div className={styles.studentList}>
            {classroomStudents.length === 0 ? (
              <div className={styles.emptyList}>У класі ще немає зареєстрованих учнів</div>
            ) : availableStudents.length === 0 ? (
              <div className={styles.emptyList}>
                Всі учні цього класу вже зараховані до цього курсу
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className={styles.emptyList}>Учнів не знайдено за пошуком</div>
            ) : (
              filteredStudents.map((s) => {
                const isChecked = selectedUuids.includes(s.uuid);
                const isSelectionDisabled =
                  isLoading || (!isChecked && selectedUuids.length >= availableSlots);
                return (
                  <label
                    key={s.uuid}
                    className={`${styles.studentRow} ${
                      isChecked ? styles.studentRowSelected : ''
                    } ${isSelectionDisabled ? styles.studentRowDisabled : ''}`}
                  >
                    <input
                      type="checkbox"
                      className={styles.studentCheckbox}
                      checked={isChecked}
                      onChange={() => handleToggleStudent(s.uuid)}
                      disabled={isSelectionDisabled}
                    />
                    <div className={styles.studentMeta}>
                      <span className={styles.studentName}>
                        {s.lastName} {s.firstName}
                      </span>
                      <span className={styles.studentLogin}>{s.login}</span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
