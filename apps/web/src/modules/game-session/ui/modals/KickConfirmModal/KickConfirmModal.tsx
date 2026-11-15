import { Button, Modal } from '../../../../../shared';
import type { KickConfirmModalProps } from './KickConfirmModal.types';
import styles from './KickConfirmModal.module.css';

export function KickConfirmModal({
  isOpen,
  participantName,
  onConfirm,
  onCancel,
  onAfterClose,
}: KickConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      onAfterClose={onAfterClose}
      size="sm"
      title="Вилучення учасника"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Скасувати
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Вилучити
          </Button>
        </>
      }
    >
      <p className={styles.message}>
        Ви дійсно хочете вилучити учасника <strong>{participantName}</strong> з вікторини?
      </p>
    </Modal>
  );
}
