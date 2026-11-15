import { useEffect, useState } from 'react';
import { CloseIcon, MailIcon } from '../../../../shared';
import { VerificationCodeInput } from '../../../auth/ui/VerificationCodeInput';
import type { VerificationCodeModalProps } from './VerificationCodeModal.types';
import styles from './VerificationCodeModal.module.css';

function VerificationCodeModalContent({
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
}: Omit<VerificationCodeModalProps, 'isOpen'>) {
  const [codeValue, setCodeValue] = useState('');

  // Close modal on Escape unless a request is in flight
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, onClose]);

  const handleBackdropClick = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleResendClick = async () => {
    setCodeValue('');
    onClearError();
    await onResend();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
    >
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h3 id="verification-modal-title" className={styles.title}>
            {title}
          </h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Закрити"
          >
            <CloseIcon size={18} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.body}>
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
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Скасувати
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => void onConfirm(codeValue)}
            disabled={isSubmitting || codeValue.length < 6}
          >
            {isSubmitting ? 'Перевірка...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VerificationCodeModal({
  isOpen,
  ...props
}: VerificationCodeModalProps) {
  // Mount inner content only while open so code input resets cleanly each time
  if (!isOpen) return null;
  return <VerificationCodeModalContent {...props} />;
}
