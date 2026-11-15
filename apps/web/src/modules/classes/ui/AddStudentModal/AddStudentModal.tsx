import { useEffect, useId, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  CheckIcon,
  CopyIcon,
  Modal,
  copyToClipboard,
  generateSimplePassword,
  generateStudentLogin,
} from '../../../../shared';
import { useAddStudentMutation } from '../../api/classesApi';
import {
  addStudentSchema,
  type AddStudentFormData,
  type AddStudentFormProps,
  type AddStudentModalProps,
  type AddStudentSuccessProps,
  type CreatedStudentCredentials,
} from './AddStudentModal.types';
import styles from './AddStudentModal.module.css';

function AddStudentSuccess({ credentials, copied, onCopy }: AddStudentSuccessProps) {
  return (
    <div className={styles.successBox}>
      <h4 className={styles.successTitle}>
        <CheckIcon size={18} aria-hidden="true" />
        Обліковий запис створено!
      </h4>
      <p className={styles.successSubtitle}>
        Передайте ці облікові дані учню для входу в систему:
      </p>

      <div className={styles.credentialsCard}>
        <div className={styles.credentialItem}>
          <span className={styles.credentialLabel}>Учень:</span>
          <span className={styles.credentialVal}>
            {credentials.firstName} {credentials.lastName}
          </span>
        </div>
        <div className={styles.credentialItem}>
          <span className={styles.credentialLabel}>Логін:</span>
          <span className={styles.credentialVal}>{credentials.login}</span>
        </div>
        <div className={styles.credentialItem}>
          <span className={styles.credentialLabel}>Пароль:</span>
          <span className={styles.credentialVal}>{credentials.password}</span>
        </div>
      </div>

      <Button variant="secondary" fullWidth onClick={() => void onCopy()}>
        {copied ? (
          <CheckIcon size={16} aria-hidden="true" />
        ) : (
          <CopyIcon size={16} aria-hidden="true" />
        )}
        {copied ? 'Скопійовано в буфер!' : 'Скопіювати дані для входу'}
      </Button>
    </div>
  );
}

function AddStudentForm({
  formId,
  isLoading,
  errorMessage,
  onSubmitForm,
}: AddStudentFormProps) {
  const [isCustomLogin, setIsCustomLogin] = useState(false);

  const lastNameId = useId();
  const lastNameErrorId = useId();
  const firstNameId = useId();
  const firstNameErrorId = useId();
  const loginId = useId();
  const loginErrorId = useId();
  const passwordId = useId();
  const passwordErrorId = useId();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      login: '',
      password: generateSimplePassword(8),
    },
  });

  const [firstName, lastName] = useWatch({
    control,
    name: ['firstName', 'lastName'],
  });

  // Auto-generate login based on first & last name unless customized by teacher
  useEffect(() => {
    if (!isCustomLogin && (firstName || lastName)) {
      const generated = generateStudentLogin(firstName || '', lastName || '');
      setValue('login', generated, { shouldValidate: true });
    }
  }, [firstName, lastName, isCustomLogin, setValue]);

  const handleRegeneratePassword = () => {
    setValue('password', generateSimplePassword(8), { shouldValidate: true });
  };

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmitForm)} className={styles.form} noValidate>
      {errorMessage && (
        <div className={styles.errorBanner} role="alert">
          {errorMessage}
        </div>
      )}

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor={lastNameId}>
            Прізвище *
          </label>
          <input
            id={lastNameId}
            type="text"
            placeholder="Введіть прізвище"
            disabled={isLoading}
            className={`${styles.formInput} ${errors.lastName ? styles.inputError : ''}`}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? lastNameErrorId : undefined}
            autoFocus
            {...register('lastName')}
          />
          {errors.lastName && (
            <p id={lastNameErrorId} className={styles.fieldError} role="alert">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor={firstNameId}>
            Ім&apos;я *
          </label>
          <input
            id={firstNameId}
            type="text"
            placeholder="Введіть ім'я"
            disabled={isLoading}
            className={`${styles.formInput} ${errors.firstName ? styles.inputError : ''}`}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? firstNameErrorId : undefined}
            {...register('firstName')}
          />
          {errors.firstName && (
            <p id={firstNameErrorId} className={styles.fieldError} role="alert">
              {errors.firstName.message}
            </p>
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor={loginId}>
          Логін (автоматично транслітерується)
        </label>
        <div className={styles.inputWrapper}>
          <input
            id={loginId}
            type="text"
            placeholder="Генерується автоматично"
            disabled={isLoading}
            className={`${styles.formInput} ${errors.login ? styles.inputError : ''}`}
            aria-invalid={Boolean(errors.login)}
            aria-describedby={errors.login ? loginErrorId : undefined}
            {...register('login', {
              onChange: () => setIsCustomLogin(true),
            })}
          />
        </div>
        {errors.login && (
          <p id={loginErrorId} className={styles.fieldError} role="alert">
            {errors.login.message}
          </p>
        )}
        <span className={styles.hintText}>
          Можна змінити вручну (на кінець додадуться 3 цифри для унікальності)
        </span>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor={passwordId}>
          Пароль (авто-генерація)
        </label>
        <div className={styles.inputWrapper}>
          <input
            id={passwordId}
            type="text"
            disabled={isLoading}
            className={`${styles.formInput} ${styles.formInputWithAction} ${
              errors.password ? styles.inputError : ''
            }`}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? passwordErrorId : undefined}
            {...register('password')}
          />
          <button
            type="button"
            className={styles.inputActionBtn}
            onClick={handleRegeneratePassword}
            disabled={isLoading}
            title="Згенерувати інший пароль"
            aria-label="Згенерувати інший пароль"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
        {errors.password && (
          <p id={passwordErrorId} className={styles.fieldError} role="alert">
            {errors.password.message}
          </p>
        )}
        <span className={styles.hintText}>
          Простий надійний код для швидкого входу учня
        </span>
      </div>
    </form>
  );
}

export function AddStudentModal({ classUuid, isOpen, onClose }: AddStudentModalProps) {
  const [createdCredentials, setCreatedCredentials] =
    useState<CreatedStudentCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const copyTimerRef = useRef<number | null>(null);
  const formId = useId();

  const [addStudent, { isLoading, error, reset: resetMutation }] = useAddStudentMutation();

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const handleSubmitForm = async (data: AddStudentFormData) => {
    try {
      const res = await addStudent({
        classUuid,
        body: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          login: data.login?.trim() || undefined,
          password: data.password?.trim() || undefined,
        },
      }).unwrap();

      setCreatedCredentials(res.credentials);
    } catch {
      // Handled by RTK Query error state
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Дані для входу до ViaQuiz:\nІм'я: ${createdCredentials.firstName} ${createdCredentials.lastName}\nЛогін: ${createdCredentials.login}\nПароль: ${createdCredentials.password}`;
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2500);
    }
  };

  const handleAddAnother = () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    setCreatedCredentials(null);
    setCopied(false);
    resetMutation();
  };

  const handleAfterClose = () => {
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = null;
    }
    setCreatedCredentials(null);
    setCopied(false);
    resetMutation();
  };

  const errorMessage =
    error &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'message' in error.data
      ? String(error.data.message)
      : error
        ? 'Не вдалося додати учня'
        : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={handleAfterClose}
      size="md"
      title={createdCredentials ? 'Учня успішно додано' : 'Додати нового учня'}
      isBusy={isLoading}
      footer={
        createdCredentials ? (
          <>
            <Button variant="secondary" onClick={handleAddAnother}>
              + Додати ще одного
            </Button>
            <Button variant="primary" onClick={onClose}>
              Готово
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Скасувати
            </Button>
            <Button type="submit" form={formId} variant="primary" disabled={isLoading}>
              {isLoading ? 'Створення...' : 'Створити учня'}
            </Button>
          </>
        )
      }
    >
      {createdCredentials ? (
        <AddStudentSuccess
          credentials={createdCredentials}
          copied={copied}
          onCopy={handleCopyCredentials}
        />
      ) : (
        <AddStudentForm
          formId={formId}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSubmitForm={handleSubmitForm}
        />
      )}
    </Modal>
  );
}
