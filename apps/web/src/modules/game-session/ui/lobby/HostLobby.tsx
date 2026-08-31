import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCodeModal } from '../modals/QrCodeModal';
import { ParticipantsSidebar } from '../sidebar/ParticipantsSidebar';
import { CopyIcon, CheckIcon, PlayIcon } from '../../../../shared/ui/icons';
import type { ParticipantDto } from '@viaquiz/shared-types';
import styles from '../GameSession.module.css';
import { Link } from 'react-router-dom';

export interface HostLobbyProps {
	joinCode: string;
	roomUuid?: string;
	participants: ParticipantDto[];
	onStartGame: () => void;
	onKickParticipant: (participantId: number) => void;
}

export function HostLobby({
	joinCode,
	roomUuid: _roomUuid,
	participants,
	onStartGame,
	onKickParticipant,
}: HostLobbyProps) {
	const [isQrModalOpen, setIsQrModalOpen] = useState(false);
	const [copiedField, setCopiedField] = useState<'url' | 'code' | null>(null);

	const joinUrl = `${window.location.origin}/join?code=${joinCode}`;

	const handleCopy = (text: string, type: 'url' | 'code') => {
		navigator.clipboard.writeText(text);
		setCopiedField(type);
		setTimeout(() => setCopiedField(null), 2000);
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
								className={`${styles['lobby-copy-icon-btn']} ${copiedField === 'url' ? styles['is-copied'] : ''}`}
								onClick={() => handleCopy(joinUrl, 'url')}
								title={copiedField === 'url' ? 'Скопійовано!' : 'Скопіювати посилання'}
							>
								{copiedField === 'url' ? (
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
								className={`${styles['lobby-copy-icon-btn']} ${copiedField === 'code' ? styles['is-copied'] : ''}`}
								onClick={() => handleCopy(joinCode, 'code')}
								title={copiedField === 'code' ? 'Скопійовано!' : 'Скопіювати код'}
							>
								{copiedField === 'code' ? (
									<CheckIcon size={16} />
								) : (
									<CopyIcon size={16} />
								)}
							</button>
						</div>
						<div
							className={styles['lobby-pin-display']}
							onClick={() => handleCopy(joinCode, 'code')}
							title="Натисніть, щоб скопіювати код"
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

