import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, CopyIcon, LockIcon, copyToClipboard } from '../../../../shared';
import { useUserContext } from '../../../auth/context';
import { useUpdateProfileMutation } from '../../api';
import {
  formatSettingsError,
  profileSettingsSchema,
  type ProfileSettingsFormData,
  type SettingsStatusFeedback,
} from '../../models';
import { SettingsSectionCard } from '../SettingsSectionCard';
import type { ProfileSettingsSectionProps } from './ProfileSettingsSection.types';
import styles from './ProfileSettingsSection.module.css';

export function ProfileSettingsSection({ user }: ProfileSettingsSectionProps) {
  const { setUser } = useUserContext();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [feedback, setFeedback] = useState<SettingsStatusFeedback | null>(null);
  const [isLoginCopied, setIsLoginCopied] = useState(false);

  const formValues = useMemo<ProfileSettingsFormData>(
    () => ({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
    }),
    [user?.firstName, user?.lastName],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileSettingsFormData>({
    resolver: zodResolver(profileSettingsSchema),
    values: formValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const handleCopyLogin = async () => {
    if (!user?.login) return;
    const copied = await copyToClipboard(user.login);
    if (!copied) return;
    setIsLoginCopied(true);
    window.setTimeout(() => setIsLoginCopied(false), 1500);
  };

  const onSubmit = async (data: ProfileSettingsFormData) => {
    setFeedback(null);
    try {
      const updatedUser = await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      }).unwrap();

      setUser(updatedUser);
      reset({
        firstName: updatedUser.firstName ?? '',
        lastName: updatedUser.lastName ?? '',
      });
      setFeedback({
        type: 'success',
        message: 'Особисті дані успішно оновлено.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: formatSettingsError(error, 'Не вдалося оновити особисті дані.'),
      });
    }
  };

  return (
    <SettingsSectionCard
      title="Особисті дані"
      description="Керуйте вашим ім'ям та прізвищем, які відображаються учням та колегам. Логін є постійним."
      feedback={feedback}
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="settings-firstName" className={styles.label}>
              Ім&apos;я
            </label>
            <input
              id="settings-firstName"
              type="text"
              className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
              placeholder="Введіть ім'я"
              disabled={isLoading}
              {...register('firstName')}
            />
            {errors.firstName && (
              <span className={styles.fieldError}>{errors.firstName.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="settings-lastName" className={styles.label}>
              Прізвище
            </label>
            <input
              id="settings-lastName"
              type="text"
              className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
              placeholder="Введіть прізвище"
              disabled={isLoading}
              {...register('lastName')}
            />
            {errors.lastName && (
              <span className={styles.fieldError}>{errors.lastName.message}</span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <span className={styles.label}>Логін</span>
            <span className={styles.readOnlyTag}>
              <LockIcon size={12} aria-hidden="true" />
              <span>Лише читання</span>
            </span>
          </div>

          <div className={styles.readOnlyBox}>
            <span className={styles.readOnlyValue}>
              {user?.login ? `@${user.login}` : '—'}
            </span>
            {user?.login && (
              <button
                type="button"
                className={`${styles.copyBtn} ${isLoginCopied ? styles.copyBtnSuccess : ''}`}
                onClick={handleCopyLogin}
              >
                {isLoginCopied ? (
                  <>
                    <CheckIcon size={13} aria-hidden="true" />
                    <span>Скопійовано</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={13} aria-hidden="true" />
                    <span>Копіювати</span>
                  </>
                )}
              </button>
            )}
          </div>

          <p className={styles.hint}>
            Логін використовується як постійний ідентифікатор акаунта та не підлягає зміні.
          </p>
        </div>

        <div className={styles.footer}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={!isDirty || isLoading}
          >
            {isLoading ? 'Збереження...' : 'Зберегти зміни'}
          </button>
        </div>
      </form>
    </SettingsSectionCard>
  );
}
