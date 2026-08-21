import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import styles from '../GameSession.module.css';

export interface QrCodeModalProps {
	isOpen: boolean;
	onClose: () => void;
	joinUrl: string;
}

export function QrCodeModal({ isOpen, onClose, joinUrl }: QrCodeModalProps) {
	const [rendered, setRendered] = useState(isOpen);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setRendered(true);
			setIsClosing(false);
		} else if (rendered && !isClosing) {
			setIsClosing(true);
			const timer = setTimeout(() => {
				setRendered(false);
				setIsClosing(false);
			}, 220);
			return () => clearTimeout(timer);
		}
	}, [isOpen, rendered, isClosing]);

	const handleClose = useCallback(() => {
		if (isClosing) return;
		setIsClosing(true);
		setTimeout(() => {
			onClose();
			setRendered(false);
			setIsClosing(false);
		}, 220);
	}, [isClosing, onClose]);

	// Handle Escape key to close modal
	useEffect(() => {
		if (!rendered || isClosing) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				handleClose();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [rendered, isClosing, handleClose]);

	if (!rendered) return null;

	return (
		<div
			className={`${styles['qr-modal-backdrop']} ${isClosing ? styles['is-closing'] : ''}`}
			onClick={handleClose}
		>
			<div
				className={`${styles['qr-modal-container']} ${isClosing ? styles['is-closing'] : ''}`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className={styles['qr-modal-card']}>
					<div className={styles['qr-modal-white-box']}>
						<QRCodeSVG
							value={joinUrl}
							size={380}
							level="Q"
							className={styles['qr-modal-svg']}
						/>
					</div>
				</div>

				<p className={`${styles['qr-modal-hint-text']} ${isClosing ? styles['is-closing'] : ''}`}>
					Щоб закрити вікно натисніть на фон
				</p>
			</div>
		</div>
	);
}




