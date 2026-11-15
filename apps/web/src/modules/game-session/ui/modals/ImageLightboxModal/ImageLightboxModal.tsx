import { CloseIcon, Modal } from '../../../../../shared';
import type { ImageLightboxModalProps } from './ImageLightboxModal.types';
import styles from './ImageLightboxModal.module.css';

export function ImageLightboxModal({
  isOpen,
  imageUrl,
  onClose,
  onAfterClose,
}: ImageLightboxModalProps) {
  return (
    <Modal
      isOpen={isOpen && Boolean(imageUrl)}
      onClose={onClose}
      onAfterClose={onAfterClose}
      size="unstyled"
      ariaLabel="Перегляд зображення"
    >
      {imageUrl && (
        <div className={styles.container}>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрити зображення"
          >
            <CloseIcon size={18} aria-hidden="true" />
          </button>
          <img src={imageUrl} alt="Збільшене зображення" className={styles.image} />
        </div>
      )}
    </Modal>
  );
}
