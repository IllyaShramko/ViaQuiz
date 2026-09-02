import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { QrCodeModalProps } from './QrCodeModal.types';
import styles from '../../GameSession.module.css';

export function QrCodeModal({ isOpen, onClose, joinUrl }: QrCodeModalProps) {
	const [rendered, setRendered] = useState(isOpen);
	const [isClosing, setIsClosing] = useState(false);
	const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Sync with isOpen prop (external control).
	// Only start the close animation here when isOpen goes false
	// AND we're not already closing (handleClose handles its own animation).
	useEffect(() => {
		if (isOpen) {
			// Opening: cancel any pending close, show immediately
			if (closingTimerRef.current) {
				clearTimeout(closingTimerRef.current);
				closingTimerRef.current = null;
			}
			setRendered(true);
			setIsClosing(false);
		} else if (rendered && !isClosing) {
			// isOpen became false externally and we're not already closing —
			// start close animation
			setIsClosing(true);
			closingTimerRef.current = setTimeout(() => {
				setRendered(false);
				setIsClosing(false);
				closingTimerRef.current = null;
			}, 220);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (closingTimerRef.current) {
				clearTimeout(closingTimerRef.current);
			}
		};
	}, []);

	const handleClose = useCallback(() => {
		if (isClosing) return;
		setIsClosing(true);
		closingTimerRef.current = setTimeout(() => {
			onClose();
			setRendered(false);
			setIsClosing(false);
			closingTimerRef.current = null;
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
