import { ChevronDownIcon } from '../../../../../shared/ui/icons';
import type { StudentLobbyProps } from './StudentLobby.types';
import styles from './StudentLobby.module.css';

export function StudentLobby({
	quizName = 'Вікторина',
	teacherName,
	totalQuestions,
	participants,
	currentParticipantId,
	currentParticipantNickname,
}: StudentLobbyProps) {
	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<div className={styles.statusRow}>
					<span className={styles.statusDot} aria-hidden="true" />
					<span className={styles.statusText}>Очікуємо запуску тесту організатором</span>
				</div>

				<h1 className={styles.title}>{quizName}</h1>

				{currentParticipantNickname && (
					<div className={styles.identityBanner}>
						<span className={styles.identityLabel}>Ви приєдналися як</span>
						<strong className={styles.identityName}>{currentParticipantNickname}</strong>
					</div>
				)}

				{(teacherName || (typeof totalQuestions === 'number' && totalQuestions > 0)) && (
					<div className={styles.metaList}>
						{teacherName && (
							<div className={styles.metaItem}>
								<span className={styles.metaLabel}>Організатор</span>
								<strong className={styles.metaValue}>{teacherName}</strong>
							</div>
						)}
						{typeof totalQuestions === 'number' && totalQuestions > 0 && (
							<div className={styles.metaItem}>
								<span className={styles.metaLabel}>Запитань</span>
								<strong className={styles.metaValue}>{totalQuestions}</strong>
							</div>
						)}
					</div>
				)}

				<details className={styles.accordion}>
					<summary className={styles.accordionSummary}>
						<span className={styles.accordionLabel}>
							Учасники в кімнаті
							<span className={styles.countBadge}>{participants.length}</span>
						</span>
						<ChevronDownIcon size={16} className={styles.accordionIcon} />
					</summary>

					<div className={styles.accordionBody}>
						{participants.length > 0 ? (
							<div className={styles.participantsTags}>
								{participants.map((participant) => {
									const isMe =
										currentParticipantId != null &&
										participant.participantId === currentParticipantId;
									return (
										<span
											key={participant.participantId}
											className={`${styles.tag} ${isMe ? styles.isMe : ''}`}
										>
											{participant.nickname}
											{isMe ? ' (ви)' : ''}
										</span>
									);
								})}
							</div>
						) : (
							<p className={styles.emptyText}>Поки що немає підключених учасників</p>
						)}
					</div>
				</details>
			</div>
		</div>
	);
}
