import { useState } from 'react';
import { Button, MailIcon, Modal } from '../../../../shared';
import { VerificationCodeInput } from '../../../auth/ui/VerificationCodeInput';
import type { VerificationCodeModalProps } from './VerificationCodeModal.types';
import styles from './VerificationCodeModal.module.css';

export function VerificationCodeModal({
  isOpen,
  title,
  description,
  targetEmail,
  confirmLabel,
  cooldown,
  isSubmitting,
  isResending,
  error,
  onClearError,
  onConfirm,
  onResend,
  onClose,
  onAfterClose,
}: VerificationCodeModalProps) {
  const [codeValue, setCodeValue] = useState('');

  const handleResendClick = async () => {
    setCodeValue('');
    onClearError();
    await onResend();
  };

  const handleAfterClose = () => {
    setCodeValue('');
    onAfterClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onAfterClose={handleAfterClose}
      size="sm"
      title={title}
      isBusy={isSubmitting}
      bodyClassName={styles.body}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Скасувати
          </Button>
          <Button
            variant="primary"
            onClick={() => void onConfirm(codeValue)}
            disabled={isSubmitting || codeValue.length < 6}
          >
            {isSubmitting ? 'Перевірка...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p className={styles.description}>{description}</p>

      <div className={styles.emailChip}>
        <MailIcon size={15} className={styles.emailIcon} aria-hidden="true" />
        <span>{targetEmail}</span>
      </div>

      <div className={styles.codeGroup}>
        <span className={styles.codeLabel}>Код підтвердження</span>
        <VerificationCodeInput
          value={codeValue}
          onChange={(nextValue) => {
            setCodeValue(nextValue);
            if (error) onClearError();
          }}
          onComplete={(completedCode) => {
            void onConfirm(completedCode);
          }}
          error={error ?? undefined}
          disabled={isSubmitting}
          autoFocus
        />
        {error && (
          <p className={styles.errorText} role="alert">
            {error}
          </p>
        )}
      </div>

      <div className={styles.resendRow}>
        {cooldown > 0 ? (
          <span className={styles.cooldownText}>
            Надіслати повторно можна через {cooldown} с
          </span>
        ) : (
          <button
            type="button"
            className={styles.resendBtn}
            onClick={() => void handleResendClick()}
            disabled={isResending || isSubmitting}
          >
            {isResending ? 'Надсилання...' : 'Надіслати код повторно'}
          </button>
        )}
      </div>
    </Modal>
  );
}
