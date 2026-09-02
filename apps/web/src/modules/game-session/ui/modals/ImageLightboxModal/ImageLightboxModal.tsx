import type { ImageLightboxModalProps } from './ImageLightboxModal.types';
import styles from '../../GameSession.module.css';

export function ImageLightboxModal({
	isOpen,
	imageUrl,
	onClose,
}: ImageLightboxModalProps) {
	if (!isOpen || !imageUrl) return null;

	return (
		<div className={styles['modal-backdrop']} onClick={onClose}>
			<div
				style={{
					position: 'relative',
					maxWidth: '90vw',
					maxHeight: '90vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					className={styles['modal-close-btn']}
					onClick={onClose}
					style={{ top: '-2.5rem', right: '0', color: '#fff', fontSize: '1.5rem' }}
				>
					✕
				</button>
				<img
					src={imageUrl}
					alt="Enlarged media"
					style={{
						maxWidth: '100%',
						maxHeight: '85vh',
						objectFit: 'contain',
						borderRadius: '0.75rem',
						boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
					}}
				/>
			</div>
		</div>
	);
}
