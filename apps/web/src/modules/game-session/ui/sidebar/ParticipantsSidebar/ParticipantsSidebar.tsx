import { useState, useMemo } from 'react';
import { KickConfirmModal } from '../../modals';
import {
	NeutralCheckIcon,
	CorrectCheckIcon,
	IncorrectCrossIcon,
	SettingsIcon,
} from '../../../../../shared/ui/icons';
import { useFlipAnimation } from '../../../../../shared/hooks';
import type { ParticipantDto } from '@viaquiz/shared-types';
import type { ParticipantsSidebarProps } from './ParticipantsSidebar.types';
import styles from './ParticipantsSidebar.module.css';

/**
 * Unified sidebar for all game phases (lobby, question, review).
 *
 * - During PROGRESS: shows neutral checkmark when student has answered.
 * - During REVIEWING: shows green checkmark / red cross based on correctness.
 * - On hover: reveals the participant's score instead of the icon.
 * - On click: opens kick confirmation modal.
 * - Animates participant reordering and additions smoothly using useFlipAnimation.
 */
export function ParticipantsSidebar({
	participants,
	status,
	answeredParticipantIds,
	reviewData,
	onKickParticipant,
}: ParticipantsSidebarProps) {
	const [kickTarget, setKickTarget] = useState<ParticipantDto | null>(null);
	const [hoveredId, setHoveredId] = useState<number | null>(null);

	// Sort participants by score when game has started; keep join order during lobby (AWAITING)
	const displayParticipants = useMemo(() => {
		if (status === 'AWAITING') {
			return participants;
		}
		return [...participants].sort(
			(a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname),
		);
	}, [participants, status]);

	// FLIP animation for smooth list reordering and additions (only triggered when participant list/order changes)
	const listRef = useFlipAnimation<HTMLDivElement>({
		duration: 350,
		deps: [displayParticipants],
	});

	/**
	 * Determine what to render in the right-hand side of each participant row.
	 */
	const renderStatus = (p: ParticipantDto) => {
		const isHovered = hoveredId === p.participantId;

		// On hover — always show score
		if (isHovered) {
			return (
				<span className={styles['participant-score-text']}>
					{p.score} б
				</span>
			);
		}

		// During active question — show neutral checkmark if answered
		if (status === 'PROGRESS') {
			if (answeredParticipantIds?.has(p.participantId)) {
				return (
					<span className={styles['participant-status-icon']} key={`answered-${p.participantId}`}>
						<NeutralCheckIcon size={18} />
					</span>
				);
			}
			return null; // Not answered yet — show nothing
		}

		// During review — show correct/incorrect icon
		if (status === 'REVIEWING' && reviewData?.participantAnswers) {
			const pa = reviewData.participantAnswers.find(
				(item) => item.participantId === p.participantId,
			);

			if (pa && pa.isAnswered) {
				return (
					<span className={styles['participant-status-icon']} key={`review-${p.participantId}-${pa.isCorrect}`}>
						{pa.isCorrect ? (
							<CorrectCheckIcon size={18} />
						) : (
							<IncorrectCrossIcon size={16} />
						)}
					</span>
				);
			}
			return null; // Didn't answer — show nothing
		}

		// Lobby / finished — show nothing (or score)
		if (status === 'AWAITING' || status === 'FINISHED') {
			return null;
		}

		return null;
	};

	return (
		<>
			<aside className={styles['game-sidebar']}>
				<div className={styles['game-sidebar-header']}>
					<span>Учасники: ({participants.length})</span>
					<SettingsIcon size={18} className={styles['game-sidebar-settings-icon']} />
				</div>
				<div ref={listRef} className={styles['game-sidebar-list']}>
					{displayParticipants.map((p, idx) => (
						<div
							key={p.participantId}
							data-flip-key={p.participantId}
							className={`${styles['participant-item']} ${styles['participant-item-clickable']}`}
							onClick={() => setKickTarget(p)}
							onMouseEnter={() => setHoveredId(p.participantId)}
							onMouseLeave={() => setHoveredId(null)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									setKickTarget(p);
								}
							}}
							title={`${p.nickname} — ${p.score} б`}
						>
							<div className={styles['participant-item-left']}>
								<span className={styles['participant-badge']}>{idx + 1}</span>
								<span className={styles['participant-name']}>{p.nickname}</span>
							</div>
							<div className={styles['participant-item-right']}>
								{renderStatus(p)}
							</div>
						</div>
					))}
					{participants.length === 0 && (
						<div className={styles['game-sidebar-empty']}>
							Очікуємо підключення учнів...
						</div>
					)}
				</div>
			</aside>

			<KickConfirmModal
				isOpen={!!kickTarget}
				participantName={kickTarget?.nickname || ''}
				onConfirm={() => {
					if (kickTarget) {
						onKickParticipant?.(kickTarget.participantId);
						setKickTarget(null);
					}
				}}
				onCancel={() => setKickTarget(null)}
			/>
		</>
	);
}
