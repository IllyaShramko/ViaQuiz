import type { KickConfirmModalProps } from './KickConfirmModal.types';
import styles from '../../GameSession.module.css';

export function KickConfirmModal({
	isOpen,
	participantName,
	onConfirm,
	onCancel,
}: KickConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div className={styles['modal-backdrop']} onClick={onCancel}>
			<div className={styles['modal-card']} onClick={(e) => e.stopPropagation()}>
				<h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
					Вилучення учасника
				</h3>
				<p style={{ color: 'var(--color-text-secondary, #9090a8)', lineHeight: 1.5 }}>
					Ви дійсно хочете вилучити учасника <strong style={{ color: '#fff' }}>{participantName}</strong> з вікторини?
				</p>
				<div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
					<button
						type="button"
						onClick={onCancel}
						className={styles['modal-cancel-btn']}
					>
						Скасувати
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className={styles['modal-danger-btn']}
					>
						Вилучити
					</button>
				</div>
			</div>
		</div>
	);
}
