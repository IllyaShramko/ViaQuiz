import { QRCodeSVG } from 'qrcode.react';
import { CloseIcon, Modal } from '../../../../../shared';
import type { QrCodeModalProps } from './QrCodeModal.types';
import styles from './QrCodeModal.module.css';

export function QrCodeModal({ isOpen, onClose, joinUrl, joinCode }: QrCodeModalProps) {
  const formattedCode = joinCode ? `${joinCode.slice(0, 3)} ${joinCode.slice(3)}` : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="unstyled"
      ariaLabel="QR-код для підключення"
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Підключення за QR-кодом</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Закрити"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className={styles.whiteBox}>
          <QRCodeSVG
            value={joinUrl}
            size={340}
            level="Q"
            className={styles.svg}
          />
        </div>

        <div className={styles.footer}>
          <span className={styles.domain}>joinviaquiz.com</span>
          {formattedCode && (
            <>
              <span className={styles.dot} aria-hidden="true">•</span>
              <span className={styles.code}>PIN: {formattedCode}</span>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
