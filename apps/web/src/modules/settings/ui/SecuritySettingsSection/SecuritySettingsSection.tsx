import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { USER_CONSTRAINTS } from '@viaquiz/shared-types';
import { ViewEyeIcon, ViewEyeOffIcon } from '../../../../shared';
import {
  useChangePasswordMutation,
  useSendPasswordChangeCodeMutation,
} from '../../api';
import {
  changePasswordSchema,
  confirmEmailChangeSchema,
  formatSettingsError,
  useCooldown,
  type ChangePasswordFormData,
  type SettingsStatusFeedback,
} from '../../models';
import { SettingsSectionCard } from '../SettingsSectionCard';
import { VerificationCodeModal } from '../VerificationCodeModal';
import type { SecuritySettingsSectionProps } from './SecuritySettingsSection.types';
import styles from './SecuritySettingsSection.module.css';

export function SecuritySettingsSection({ login, userEmail }: SecuritySettingsSectionProps) {
  const [sendPasswordChangeCode, { isLoading: isSendingCode }] =
    useSendPasswordChangeCodeMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [pendingPayload, setPendingPayload] = useState<ChangePasswordFormData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SettingsStatusFeedback | null>(null);
  const { cooldown, startCooldown, resetCooldown } = useCooldown();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const handleRequestCode = async (data: ChangePasswordFormData) => {
    setFeedback(null);
    setCodeError(null);

    const isSamePendingPayload =
      pendingPayload !== null &&
      pendingPayload.currentPassword === data.currentPassword &&
      pendingPayload.newPassword === data.newPassword &&
      pendingPayload.confirmNewPassword === data.confirmNewPassword;

    // Reopen the modal directly if the same password payload already has an active cooldown
    if (isSamePendingPayload && cooldown > 0) {
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await sendPasswordChangeCode({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      }).unwrap();

      setPendingPayload(data);
      startCooldown(response.cooldownSeconds || 60);
      setIsModalOpen(true);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: formatSettingsError(error, 'Не вдалося надіслати код підтвердження.'),
      });
    }
  };

  const handleResendCode = async () => {
    if (!pendingPayload || cooldown > 0 || isSendingCode) return;
    setCodeError(null);

    try {
      const response = await sendPasswordChangeCode({
        currentPassword: pendingPayload.currentPassword,
        newPassword: pendingPayload.newPassword,
        confirmNewPassword: pendingPayload.confirmNewPassword,
      }).unwrap();
      startCooldown(response.cooldownSeconds || 60);
    } catch (error) {
      setCodeError(formatSettingsError(error, 'Не вдалося повторно надіслати код.'));
    }
  };

  const handleConfirmCode = async (rawCode: string) => {
    if (!pendingPayload || isChangingPassword) return;

    const validation = confirmEmailChangeSchema.safeParse({ code: rawCode });
    if (!validation.success) {
      setCodeError(validation.error.issues[0]?.message || 'Введіть коректний 6-значний код');
      return;
    }

    setFeedback(null);
    setCodeError(null);

    try {
      await changePassword({
        currentPassword: pendingPayload.currentPassword,
        newPassword: pendingPayload.newPassword,
        confirmNewPassword: pendingPayload.confirmNewPassword,
        code: validation.data.code,
      }).unwrap();

      setIsModalOpen(false);
      resetCooldown();
      reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setFeedback({
        type: 'success',
        message: 'Пароль успішно оновлено.',
      });
    } catch (error) {
      setCodeError(formatSettingsError(error, 'Не вдалося підтвердити зміну пароля.'));
    }
  };

  const handleCloseModal = () => {
    if (isChangingPassword) return;
    setIsModalOpen(false);
  };

  const handleAfterCloseModal = () => {
    setPendingPayload(null);
    setCodeError(null);
  };

  const isBusy = isSendingCode || isChangingPassword;

  return (
    <>
      <SettingsSectionCard
        title="Зміна пароля"
        description="Після перевірки даних ми надішлемо 6-значний код підтвердження на вашу поточну електронну пошту."
        feedback={feedback}
      >
        <form className={styles.form} onSubmit={handleSubmit(handleRequestCode)} noValidate>
          {login && (
            <input
              type="text"
              name="username"
              value={login}
              autoComplete="username"
              readOnly
              hidden
            />
          )}

          <div className={styles.field}>
            <label htmlFor="settings-current-password" className={styles.label}>
              Поточний пароль
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="settings-current-password"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Введіть поточний пароль"
                className={`${styles.input} ${errors.currentPassword ? styles.inputError : ''}`}
                disabled={isBusy}
                {...register('currentPassword')}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowCurrent((prev) => !prev)}
                aria-label={showCurrent ? 'Приховати пароль' : 'Показати пароль'}
                disabled={isBusy}
              >
                {showCurrent ? <ViewEyeOffIcon size={16} /> : <ViewEyeIcon size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <span className={styles.fieldError}>{errors.currentPassword.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="settings-new-password" className={styles.label}>
              Новий пароль
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="settings-new-password"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Введіть новий пароль"
                className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                disabled={isBusy}
                {...register('newPassword')}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowNew((prev) => !prev)}
                aria-label={showNew ? 'Приховати пароль' : 'Показати пароль'}
                disabled={isBusy}
              >
                {showNew ? <ViewEyeOffIcon size={16} /> : <ViewEyeIcon size={16} />}
              </button>
            </div>
            {errors.newPassword ? (
              <span className={styles.fieldError}>{errors.newPassword.message}</span>
            ) : (
              <p className={styles.hint}>
                Щонайменше {USER_CONSTRAINTS.PASSWORD_MIN_LENGTH} символів.
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="settings-confirm-password" className={styles.label}>
              Підтвердження нового пароля
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="settings-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Повторіть новий пароль"
                className={`${styles.input} ${errors.confirmNewPassword ? styles.inputError : ''}`}
                disabled={isBusy}
                {...register('confirmNewPassword')}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? 'Приховати пароль' : 'Показати пароль'}
                disabled={isBusy}
              >
                {showConfirm ? <ViewEyeOffIcon size={16} /> : <ViewEyeIcon size={16} />}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <span className={styles.fieldError}>{errors.confirmNewPassword.message}</span>
            )}
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.primaryBtn} disabled={isBusy}>
              {isSendingCode ? 'Надсилання коду...' : 'Оновити пароль'}
            </button>
          </div>
        </form>
      </SettingsSectionCard>

      <VerificationCodeModal
        isOpen={isModalOpen && pendingPayload !== null}
        title="Підтвердження зміни пароля"
        description="Для захисту акаунта введіть 6-значний код, надісланий на вашу поточну пошту."
        targetEmail={userEmail}
        confirmLabel="Змінити пароль"
        cooldown={cooldown}
        isSubmitting={isChangingPassword}
        isResending={isSendingCode}
        error={codeError}
        onClearError={() => setCodeError(null)}
        onConfirm={handleConfirmCode}
        onResend={handleResendCode}
        onClose={handleCloseModal}
        onAfterClose={handleAfterCloseModal}
      />
    </>
  );
}
