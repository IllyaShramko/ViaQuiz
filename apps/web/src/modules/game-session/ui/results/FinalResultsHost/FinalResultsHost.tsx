import type { FinalResultsHostProps } from './FinalResultsHost.types';
import { usePodiumAnimation } from '../hooks/usePodiumAnimation';
import { ConfettiCanvas } from '../ConfettiCanvas';
import { ResultsHeader } from '../ResultsHeader';
import { PodiumStage } from '../PodiumStage';
import { LeaderboardList } from '../LeaderboardList';
import styles from './FinalResultsHost.module.css';

export function FinalResultsHost({
	quizName = 'Вікторина',
	totalQuestions,
	leaderboard,
	roomUuid,
}: FinalResultsHostProps) {
	const topThree = leaderboard.slice(0, 3);
	const rest = leaderboard.slice(3);

	const { revealedPlaces, isConfettiActive, phase, skipToEnd } =
		usePodiumAnimation({
			autoStart: true,
			participantCount: topThree.length,
		});

	// Show remaining participants after 1st place has been revealed or animation finished
	const isListVisible = revealedPlaces.has(1) || phase === 'complete';

	return (
		<div className={styles.container}>
			{/* Confetti particle overlay for 1st place celebration */}
			<ConfettiCanvas active={isConfettiActive} />

			<div className={styles.resultsCard}>
				<ResultsHeader
					quizName={quizName}
					totalQuestions={totalQuestions}
					participantCount={leaderboard.length}
					roomUuid={roomUuid}
				/>

				{/* Quick skip action for impatient hosts */}
				{phase !== 'complete' && (
					<button
						type="button"
						className={styles.skipButton}
						onClick={skipToEnd}
						title="Показати всі результати одразу"
					>
						<span>Пропустити анімацію</span>
						<span aria-hidden="true">⏭</span>
					</button>
				)}

				{/* Animated 3-step podium */}
				<PodiumStage topThree={topThree} revealedPlaces={revealedPlaces} />

				{/* Numbered ranking list for 4th place and below */}
				<LeaderboardList
					participants={rest}
					startRank={4}
					isVisible={isListVisible}
					totalQuestions={totalQuestions}
				/>
			</div>
		</div>
	);
}
