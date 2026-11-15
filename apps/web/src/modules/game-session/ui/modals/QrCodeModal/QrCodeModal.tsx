import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../../../../../shared';
import type { QrCodeModalProps } from './QrCodeModal.types';
import styles from './QrCodeModal.module.css';

export function QrCodeModal({ isOpen, onClose, joinUrl }: QrCodeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="unstyled"
      ariaLabel="QR-код для підключення"
    >
      <div className={styles.container} onClick={onClose}>
        <div className={styles.card} onClick={(event) => event.stopPropagation()}>
          <div className={styles.whiteBox}>
            <QRCodeSVG
              value={joinUrl}
              size={380}
              level="Q"
              className={styles.svg}
            />
          </div>
        </div>

        <p className={styles.hintText}>Щоб закрити вікно натисніть на фон</p>
      </div>
    </Modal>
  );
}
