import type { StudentLobbyProps } from './StudentLobby.types';
import styles from './StudentLobby.module.css';

export function StudentLobby({
	quizName = 'Вікторина',
	teacherName = 'Вчитель',
	totalQuestions,
	participants,
}: StudentLobbyProps) {
	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<h2 className={styles.title}>{quizName}</h2>

				<div className={styles.meta}>
					<div>
						<span style={{ color: 'var(--color-text-muted)' }}>Ім'я вчителя: </span>
						<strong style={{ color: '#fff' }}>{teacherName}</strong>
					</div>
					<div>
						<span style={{ color: 'var(--color-text-muted)' }}>Кількість запитань: </span>
						<strong style={{ color: '#fff' }}>{totalQuestions}</strong>
					</div>
				</div>

				<hr className={styles.divider} />

				<div>
					<div
						className={styles['participants-title']}
						style={{ marginBottom: '0.75rem' }}
					>
						Під'єднані користувачі ({participants.length}):
					</div>

					<div className={styles['participants-tags']}>
						{participants.map((p, idx) => (
							<span key={p.participantId || idx} className={styles.tag}>
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
