import type { StudentLobbyProps } from './StudentLobby.types';
import styles from '../../GameSession.module.css';

export function StudentLobby({
	quizName = 'Вікторина',
	teacherName = 'Вчитель',
	totalQuestions,
	participants,
}: StudentLobbyProps) {
	return (
		<div className={styles['game-main-content']}>
			<div className={styles['student-lobby-card']}>
				<h2 className={styles['student-lobby-title']}>{quizName}</h2>

				<div className={styles['student-lobby-meta']}>
					<div>
						<span style={{ color: 'var(--color-text-muted)' }}>Ім'я вчителя: </span>
						<strong style={{ color: '#fff' }}>{teacherName}</strong>
					</div>
					<div>
						<span style={{ color: 'var(--color-text-muted)' }}>Кількість запитань: </span>
						<strong style={{ color: '#fff' }}>{totalQuestions}</strong>
					</div>
				</div>

				<hr className={styles['student-lobby-divider']} />

				<div>
					<div
						className={styles['student-lobby-participants-title']}
						style={{ marginBottom: '0.75rem' }}
					>
						Під'єднані користувачі ({participants.length}):
					</div>

					<div className={styles['student-lobby-participants-tags']}>
						{participants.map((p, idx) => (
							<span key={p.participantId || idx} className={styles['student-tag']}>
								{p.nickname}
							</span>
						))}
						{participants.length === 0 && (
							<span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
								Очікування інших учнів...
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
