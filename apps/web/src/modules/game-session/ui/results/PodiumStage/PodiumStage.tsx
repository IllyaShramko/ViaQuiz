import type { PodiumStageProps } from './PodiumStage.types';
import { PodiumColumn, type PodiumPlace } from '../PodiumColumn';
import styles from './PodiumStage.module.css';

interface PodiumSlot {
	participant: PodiumStageProps['topThree'][number];
	place: PodiumPlace;
}

export function PodiumStage({ topThree, revealedPlaces }: PodiumStageProps) {
	if (!topThree || topThree.length === 0) {
		return (
			<div className={styles.stageContainer}>
				<p className={styles.emptyMessage}>Немає даних про учасників</p>
			</div>
		);
	}

	// Order columns physically as: [2nd (left), 1st (center), 3rd (right)]
	const slots: PodiumSlot[] = [];

	if (topThree.length >= 2 && topThree[1]) {
		slots.push({ participant: topThree[1], place: 2 });
	}

	if (topThree.length >= 1 && topThree[0]) {
		slots.push({ participant: topThree[0], place: 1 });
	}

	if (topThree.length >= 3 && topThree[2]) {
		slots.push({ participant: topThree[2], place: 3 });
	}

	return (
		<section
			className={styles.stageContainer}
			aria-label="П'єдестал переможців"
			aria-live="polite"
		>
			<div className={styles.stage}>
				{slots.map(({ participant, place }) => (
					<PodiumColumn
						key={participant.participantId || participant.participantUuid || place}
						place={place}
						nickname={participant.nickname}
						score={participant.score}
						isRevealed={revealedPlaces.has(place)}
					/>
				))}
			</div>

			{/* Decorative podium floor baseline */}
			<div className={styles.floorLine} aria-hidden="true" />
		</section>
	);
}
