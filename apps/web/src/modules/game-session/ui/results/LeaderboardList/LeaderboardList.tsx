import type { CSSProperties } from 'react';
import type { LeaderboardListProps } from './LeaderboardList.types';
import styles from './LeaderboardList.module.css';

export function LeaderboardList({
	participants,
	startRank = 4,
	isVisible,
	totalQuestions,
}: LeaderboardListProps) {
	if (!isVisible || !participants || participants.length === 0) {
		return null;
	}

	const maxPoints = totalQuestions * 1000 || 1;

	return (
		<section className={styles.container} aria-label="Інші учасники вікторини">
			<h3 className={styles.title}>Інші учасники</h3>
			<div className={styles.tableWrapper}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th className={styles.thRank}>#</th>
							<th className={styles.thName}>Ім'я учасника</th>
							<th className={styles.thScore}>Сума балів</th>
							<th className={styles.thGrade}>Оцінка (1-12)</th>
						</tr>
					</thead>
					<tbody>
						{participants.map((p, idx) => {
							const rank = startRank + idx;
							const grade12 = Math.min(
								12,
								Math.max(1, Math.round((p.score / maxPoints) * 12))
							);

							const rowStyle = {
								'--row-index': idx,
							} as CSSProperties;

							return (
								<tr
									key={p.participantId || p.participantUuid || idx}
									className={styles.row}
									style={rowStyle}
								>
									<td className={styles.tdRank}>{rank}</td>
									<td className={styles.tdName}>
										<span className={styles.nickname} title={p.nickname}>
											{p.nickname}
										</span>
									</td>
									<td className={styles.tdScore}>
										<span className={styles.scoreValue}>
											{p.score.toLocaleString()}
										</span>
									</td>
									<td className={styles.tdGrade}>
										<span className={styles.gradeBadge}>{grade12} / 12</span>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</section>
	);
}
