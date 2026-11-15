import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon } from '../../../../shared';
import { useUserContext } from '../../../auth/context';
import {
  useChangeEmailMutation,
  useSendEmailChangeCodeMutation,
} from '../../api';
import {
  confirmEmailChangeSchema,
  formatSettingsError,
  requestEmailChangeSchema,
  useCooldown,
  type RequestEmailChangeFormData,
  type SettingsStatusFeedback,
} from '../../models';
import { SettingsSectionCard } from '../SettingsSectionCard';
import { VerificationCodeModal } from '../VerificationCodeModal';
import type { AccountEmailSectionProps } from './AccountEmailSection.types';
import styles from './AccountEmailSection.module.css';

export function AccountEmailSection({ user }: AccountEmailSectionProps) {
  const { login: updateSession } = useUserContext();
  const [sendCode, { isLoading: isSendingCode }] = useSendEmailChangeCodeMutation();
  const [changeEmail, { isLoading: isChangingEmail }] = useChangeEmailMutation();

  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SettingsStatusFeedback | null>(null);
  const { cooldown, startCooldown, resetCooldown } = useCooldown();

  const {
    register,
    handleSubmit,
    setError,
    reset: resetEmailForm,
    formState: { errors },
  } = useForm<RequestEmailChangeFormData>({
    resolver: zodResolver(requestEmailChangeSchema),
    defaultValues: { email: '' },
  });

  const handleRequestCode = async (data: RequestEmailChangeFormData) => {
    setFeedback(null);
    setCodeError(null);

    if (user?.email && data.email === user.email.toLowerCase()) {
      setError('email', {
        type: 'manual',
        message: 'Новий email має відрізнятися від поточного',
      });
      return;
    }

    // Reopen verification modal directly if the same email still has an active cooldown
    if (pendingEmail === data.email && cooldown > 0) {
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await sendCode({ email: data.email }).unwrap();
      setPendingEmail(data.email);
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
    if (!pendingEmail || cooldown > 0 || isSendingCode) return;
    setCodeError(null);

    try {
      const response = await sendCode({ email: pendingEmail }).unwrap();
      startCooldown(response.cooldownSeconds || 60);
    } catch (error) {
      setCodeError(formatSettingsError(error, 'Не вдалося повторно надіслати код.'));
    }
  };

  const handleConfirmCode = async (rawCode: string) => {
    if (!pendingEmail || isChangingEmail) return;

    const validation = confirmEmailChangeSchema.safeParse({ code: rawCode });
    if (!validation.success) {
      setCodeError(validation.error.issues[0]?.message || 'Введіть коректний 6-значний код');
      return;
    }

    setFeedback(null);
    setCodeError(null);

    try {
      const result = await changeEmail({
        email: pendingEmail,
        code: validation.data.code,
      }).unwrap();

      // Update both JWT token and user state atomically after email change
      updateSession(result.token, result.user);
      setIsModalOpen(false);
      setPendingEmail(null);
      resetCooldown();
      resetEmailForm({ email: '' });
      setFeedback({
        type: 'success',
        message: `Електронну пошту успішно змінено на ${result.user.email}.`,
      });
    } catch (error) {
      setCodeError(formatSettingsError(error, 'Не вдалося підтвердити зміну email.'));
    }
  };

  const handleCloseModal = () => {
    if (isChangingEmail) return;
    setIsModalOpen(false);
    setCodeError(null);
  };

  const isBusy = isSendingCode || isChangingEmail;

  return (
    <>
      <SettingsSectionCard
        title="Електронна пошта"
        description="Email використовується для входу в акаунт та отримання кодів підтвердження."
        feedback={feedback}
      >
        <div className={styles.currentEmailCard}>
          <div className={styles.currentEmailMeta}>
            <span className={styles.currentLabel}>Поточна адреса</span>
            <span className={styles.currentValue}>{user?.email || '—'}</span>
          </div>
          <span className={styles.verifiedTag}>
            <CheckIcon size={12} aria-hidden="true" />
            <span>Підтверджено</span>
          </span>
        </div>

        <div className={styles.divider} />

        <form className={styles.form} onSubmit={handleSubmit(handleRequestCode)} noValidate>
          <div className={styles.field}>
            <label htmlFor="settings-new-email" className={styles.label}>
              Нова електронна пошта
            </label>
            <input
              id="settings-new-email"
              type="email"
              autoComplete="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="name@example.com"
              disabled={isBusy}
              {...register('email')}
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email.message}</span>
            )}
            <p className={styles.hint}>
              На нову адресу буде надіслано 6-значний код підтвердження. Поточний email залишиться активним до завершення перевірки.
            </p>
          </div>

          <div className={styles.footer}>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isBusy}
            >
              {isSendingCode ? 'Надсилання коду...' : 'Надіслати код'}
            </button>
          </div>
        </form>
      </SettingsSectionCard>

      <VerificationCodeModal
        isOpen={isModalOpen && pendingEmail !== null}
        title="Підтвердження нової пошти"
        description="Введіть 6-значний код, який ми надіслали на нову електронну адресу."
        targetEmail={pendingEmail ?? ''}
        confirmLabel="Підтвердити email"
        cooldown={cooldown}
        isSubmitting={isChangingEmail}
        isResending={isSendingCode}
        error={codeError}
        onClearError={() => setCodeError(null)}
        onConfirm={handleConfirmCode}
        onResend={handleResendCode}
        onClose={handleCloseModal}
      />
    </>
  );
}
