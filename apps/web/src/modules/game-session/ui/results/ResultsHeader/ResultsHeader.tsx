import { useNavigate } from 'react-router-dom';
import type { ResultsHeaderProps } from './ResultsHeader.types';
import styles from './ResultsHeader.module.css';

export function ResultsHeader({
	quizName,
	totalQuestions,
	participantCount,
	roomUuid,
}: ResultsHeaderProps) {
	const navigate = useNavigate();

	return (
		<header className={styles.header}>
			<div className={styles.titleGroup}>
				<h2 className={styles.title}>Результати вікторини</h2>
				<p className={styles.subtitle}>
					{quizName} • Запитань: {totalQuestions} • Учасників: {participantCount}
				</p>
			</div>

			<div className={styles.actions}>
				{roomUuid && (
					<button
						type="button"
						className={styles.reportBtn}
						onClick={() => navigate(`/dashboard/reports/${roomUuid}`)}
					>
						Переглянути повний звіт
					</button>
				)}
				<button
					type="button"
					className={styles.dashboardBtn}
					onClick={() => navigate('/dashboard')}
				>
					До панелі вчителя
				</button>
			</div>
		</header>
	);
}
