import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCodeModal } from '../modals/QrCodeModal';
import { KickConfirmModal } from '../modals/KickConfirmModal';
import { CopyIcon, CheckIcon, PlayIcon, SettingsIcon, CloseIcon } from '../../../../shared/ui/icons';
import type { ParticipantDto } from '@viaquiz/shared-types';
import styles from '../GameSession.module.css';

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
	const [kickTarget, setKickTarget] = useState<ParticipantDto | null>(null);
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
							<span className={styles['lobby-url-text']}>
								{window.location.host}/join
							</span>
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
			<aside className={styles['game-sidebar']}>
				<div className={styles['game-sidebar-header']}>
					<span>Учасники: ({participants.length})</span>
					<SettingsIcon size={18} className={styles['game-sidebar-settings-icon']} />
				</div>
				<div className={styles['game-sidebar-list']}>
					{participants.map((p, idx) => (
						<div key={p.participantId || idx} className={styles['participant-item']}>
							<div className={styles['participant-item-left']}>
								<span className={styles['participant-badge']}>{idx + 1}</span>
								<span className={styles['participant-name']}>{p.nickname}</span>
							</div>
							<button
								type="button"
								className={styles['participant-kick-btn']}
								onClick={() => setKickTarget(p)}
								title="Вилучити учасника"
								aria-label={`Вилучити ${p.nickname}`}
							>
								<CloseIcon size={16} />
							</button>
						</div>
					))}
					{participants.length === 0 && (
						<div className={styles['game-sidebar-empty']}>
							Очікуємо підключення учнів...
						</div>
					)}
				</div>
			</aside>

			{/* QR Code Modal */}
			<QrCodeModal
				isOpen={isQrModalOpen}
				onClose={() => setIsQrModalOpen(false)}
				joinUrl={joinUrl}
			/>

			{/* Kick Confirm Modal */}
			<KickConfirmModal
				isOpen={!!kickTarget}
				participantName={kickTarget?.nickname || ''}
				onConfirm={() => {
					if (kickTarget) {
						onKickParticipant(kickTarget.participantId);
						setKickTarget(null);
					}
				}}
				onCancel={() => setKickTarget(null)}
			/>
		</div>
	);
}

