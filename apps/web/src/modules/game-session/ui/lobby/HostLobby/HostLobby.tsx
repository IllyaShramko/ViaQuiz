import { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link } from 'react-router-dom';
import { QrCodeModal } from '../../modals';
import { ParticipantsSidebar } from '../../sidebar';
import { CopyIcon, CheckIcon, PlayIcon } from '../../../../../shared/ui/icons';
import { copyToClipboard } from '../../../../../shared/tools';
import type { HostLobbyProps } from './HostLobby.types';
import styles from './HostLobby.module.css';

export function HostLobby({
	joinCode,
	roomUuid: _roomUuid,
	participants,
	onStartGame,
	onKickParticipant,
}: HostLobbyProps) {
	const [isQrModalOpen, setIsQrModalOpen] = useState(false);
	const [isUrlCopied, setIsUrlCopied] = useState(false);
	const [isCodeCopied, setIsCodeCopied] = useState(false);
	const urlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const codeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const joinUrl = `${window.location.origin}/join?code=${joinCode}`;

	// Cleanup copy timeouts on unmount
	useEffect(() => {
		return () => {
			if (urlTimeoutRef.current) {
				clearTimeout(urlTimeoutRef.current);
			}
			if (codeTimeoutRef.current) {
				clearTimeout(codeTimeoutRef.current);
			}
		};
	}, []);

	const handleCopy = async (text: string, type: 'url' | 'code') => {
		const success = await copyToClipboard(text);
		if (!success) return;

		if (type === 'url') {
			setIsUrlCopied(true);
			if (urlTimeoutRef.current) {
				clearTimeout(urlTimeoutRef.current);
			}
			urlTimeoutRef.current = setTimeout(() => {
				setIsUrlCopied(false);
				urlTimeoutRef.current = null;
			}, 2000);
		} else {
			setIsCodeCopied(true);
			if (codeTimeoutRef.current) {
				clearTimeout(codeTimeoutRef.current);
			}
			codeTimeoutRef.current = setTimeout(() => {
				setIsCodeCopied(false);
				codeTimeoutRef.current = null;
			}, 2000);
		}
	};

	return (
		<div className={styles['game-layout-body']}>
			<div className={styles['game-main-content']}>
				<div className={styles['lobby-host-card']}>
					{/* Step 1: Join via link */}
					<div className={styles['lobby-step-section']}>
						<div className={styles['lobby-step-header']}>
							<div className={styles['lobby-step-header-left']}>
								<span className={styles['lobby-step-badge']}>1</span>
								<span className={styles['lobby-step-title']}>Приєднайтеся за посиланням</span>
							</div>
							<button
								type="button"
								className={`${styles['lobby-copy-icon-btn']} ${isUrlCopied ? styles['is-copied'] : ''}`}
								onClick={() => handleCopy(joinUrl, 'url')}
								title={isUrlCopied ? 'Скопійовано!' : 'Скопіювати посилання'}
							>
								{isUrlCopied ? (
									<CheckIcon size={16} />
								) : (
									<CopyIcon size={16} />
								)}
							</button>
						</div>
						<div className={styles['lobby-url-row']}>
							<Link to={joinUrl} target="_blank" className={styles['lobby-url-text']}>
								joinviaquiz.com
							</Link>
							<button
								type="button"
								className={styles['lobby-qr-preview-btn']}
								onClick={() => setIsQrModalOpen(true)}
								title="Натисніть, щоб відкрити QR-код"
								aria-label="Збільшити QR-код"
							>
								<div className={styles['lobby-qr-preview-thumb']}>
									<QRCodeSVG value={joinUrl} size={44} level="Q" />
								</div>
							</button>
						</div>
					</div>

					{/* Step 2: Join via PIN code */}
					<div className={styles['lobby-step-section']}>
						<div className={styles['lobby-step-header']}>
							<div className={styles['lobby-step-header-left']}>
								<span className={styles['lobby-step-badge']}>2</span>
								<span className={styles['lobby-step-title']}>Приєднайтеся за кодом</span>
							</div>
							<button
								type="button"
								className={`${styles['lobby-copy-icon-btn']} ${isCodeCopied ? styles['is-copied'] : ''}`}
								onClick={() => handleCopy(joinCode, 'code')}
								title={isCodeCopied ? 'Скопійовано!' : 'Скопіювати код'}
							>
								{isCodeCopied ? (
									<CheckIcon size={16} />
								) : (
									<CopyIcon size={16} />
								)}
							</button>
						</div>
						<div
							className={styles['lobby-pin-display']}
							onClick={() => handleCopy(joinCode, 'code')}
							title={isCodeCopied ? 'Скопійовано!' : 'Натисніть, щоб скопіювати код'}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									handleCopy(joinCode, 'code');
								}
							}}
						>
							{joinCode.split('').join(' ')}
						</div>
					</div>

					{/* Start Game Button */}
					<button
						type="button"
						className={styles['lobby-start-btn']}
						onClick={onStartGame}
					>
						<PlayIcon size={16} />
						<span>Почати вікторину</span>
					</button>
				</div>
			</div>

			{/* Participants Sidebar */}
			<ParticipantsSidebar
				participants={participants}
				status="AWAITING"
				onKickParticipant={onKickParticipant}
			/>

			{/* QR Code Modal */}
			<QrCodeModal
				isOpen={isQrModalOpen}
				onClose={() => setIsQrModalOpen(false)}
				joinUrl={joinUrl}
			/>
		</div>
	);
}
