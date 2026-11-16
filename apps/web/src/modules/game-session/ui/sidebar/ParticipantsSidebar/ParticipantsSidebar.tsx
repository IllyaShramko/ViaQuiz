import { useState, useMemo } from 'react';
import { KickConfirmModal } from '../../modals';
import {
	NeutralCheckIcon,
	CorrectCheckIcon,
	IncorrectCrossIcon,
	CloseIcon,
	ChevronDownIcon,
} from '../../../../../shared/ui/icons';
import { useFlipAnimation } from '../../../../../shared/hooks';
import type { ParticipantDto } from '@viaquiz/shared-types';
import type { ParticipantsSidebarProps } from './ParticipantsSidebar.types';
import styles from './ParticipantsSidebar.module.css';

/**
 * Unified participant roster sidebar across AWAITING, PROGRESS, and REVIEWING phases.
 */
export function ParticipantsSidebar({
	participants,
	status,
	answeredParticipantIds,
	reviewData,
	onKickParticipant,
	footer,
}: ParticipantsSidebarProps) {
	const [kickTarget, setKickTarget] = useState<ParticipantDto | null>(null);
	const [isKickModalOpen, setIsKickModalOpen] = useState(false);
	const [isMobileListOpen, setIsMobileListOpen] = useState(false);

	const handleRequestKick = (participant: ParticipantDto) => {
		if (!onKickParticipant) return;
		setKickTarget(participant);
		setIsKickModalOpen(true);
	};

	const displayParticipants = useMemo(() => {
		if (status === 'AWAITING') {
			return participants;
		}
		return [...participants].sort((a, b) => b.score - a.score);
	}, [participants, status]);

	// Only re-run FLIP measurements when participant membership or rank ordering changes
	const orderKey = useMemo(
		() => displayParticipants.map((p) => p.participantId).join(','),
		[displayParticipants],
	);

	const listRef = useFlipAnimation<HTMLDivElement>({
		duration: 320,
		deps: [orderKey],
	});

	const renderStatusBadge = (participantId: number) => {
		if (status === 'PROGRESS') {
			if (answeredParticipantIds?.has(participantId)) {
				return (
					<span
						className={styles.statusIcon}
						title="Відповідь надіслано"
					>
						<NeutralCheckIcon size={16} />
					</span>
				);
			}
			return null;
		}

		if (status === 'REVIEWING' && reviewData?.participantAnswers) {
			const answer = reviewData.participantAnswers.find(
				(item) => item.participantId === participantId,
			);
			if (answer?.isAnswered) {
				return (
					<span
						className={styles.statusIcon}
						title={answer.isCorrect ? 'Правильна відповідь' : 'Неправильна відповідь'}
					>
						{answer.isCorrect ? (
							<CorrectCheckIcon size={16} />
						) : (
							<IncorrectCrossIcon size={14} />
						)}
					</span>
				);
			}
		}

		return null;
	};

	return (
		<>
			<aside className={styles.sidebar}>
				<button
					type="button"
					className={styles.mobileHeaderBtn}
					onClick={() => setIsMobileListOpen((prev) => !prev)}
					aria-expanded={isMobileListOpen}
				>
					<span className={styles.headerTitle}>
						Учасники
						<span className={styles.countBadge}>{participants.length}</span>
					</span>
					<ChevronDownIcon
						size={16}
						className={`${styles.mobileChevron} ${isMobileListOpen ? styles.isOpen : ''}`}
					/>
				</button>

				<div className={styles.desktopHeader}>
					<span className={styles.headerTitle}>
						Учасники
						<span className={styles.countBadge}>{participants.length}</span>
					</span>
				</div>

				<div
					ref={listRef}
					className={`${styles.list} ${isMobileListOpen ? styles.isMobileOpen : ''}`}
				>
					{displayParticipants.map((participant, index) => (
						<div
							key={participant.participantId}
							data-flip-key={participant.participantId}
							className={styles.item}
						>
							<div className={styles.itemLeft}>
								<span className={styles.rankBadge}>{index + 1}</span>
								<span className={styles.name}>{participant.nickname}</span>
							</div>

							<div className={styles.itemRight}>
								{renderStatusBadge(participant.participantId)}

								{status !== 'AWAITING' && (
									<span className={styles.score}>{participant.score} б</span>
								)}

								{onKickParticipant && (
									<button
										type="button"
										className={styles.kickBtn}
										onClick={() => handleRequestKick(participant)}
										aria-label={`Вилучити учасника ${participant.nickname}`}
										title={`Вилучити ${participant.nickname}`}
									>
										<CloseIcon size={13} />
									</button>
								)}
							</div>
						</div>
					))}

					{participants.length === 0 && (
						<div className={styles.emptyState}>
							Очікуємо підключення учнів...
						</div>
					)}
				</div>

				{footer && <div className={styles.footerSlot}>{footer}</div>}
			</aside>

			<KickConfirmModal
				isOpen={isKickModalOpen}
				participantName={kickTarget?.nickname || ''}
				onConfirm={() => {
					if (kickTarget) {
						onKickParticipant?.(kickTarget.participantId);
						setIsKickModalOpen(false);
					}
				}}
				onCancel={() => setIsKickModalOpen(false)}
				onAfterClose={() => setKickTarget(null)}
			/>
		</>
	);
}
