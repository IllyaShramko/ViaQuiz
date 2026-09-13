import type { PodiumColumnProps } from './PodiumColumn.types';
import styles from './PodiumColumn.module.css';

/**
 * Crown SVG icon rendered above 1st place podium pillar.
 */
function CrownIcon() {
	return (
		<svg
			className={styles.crownIcon}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d="M5 19h14a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm14.5-12a1.5 1.5 0 00-1.415 1.002L14.5 9.5l-2.085-4.17a1.5 1.5 0 10-1.83 0L8.5 9.5 4.915 8.002A1.5 1.5 0 104.5 11l1.5 4h12l1.5-4a1.5 1.5 0 000-4z" />
		</svg>
	);
}

export function PodiumColumn({
	place,
	nickname,
	score,
	isRevealed,
}: PodiumColumnProps) {
	const placeClassKey = `place${place}` as 'place1' | 'place2' | 'place3';
	const placeClass = styles[placeClassKey] || '';

	return (
		<div
			className={`${styles.wrapper} ${placeClass}`}
			aria-label={`${place}-е місце: ${nickname}, ${score} балів`}
		>
			{/* Participant name and score displayed above the podium pillar */}
			<div
				className={`${styles.participantHeader} ${
					isRevealed ? styles.participantHeaderRevealed : ''
				}`}
			>
				{place === 1 && (
					<div className={styles.crownContainer}>
						<CrownIcon />
					</div>
				)}
				<span className={styles.nickname} title={nickname}>
					{nickname}
				</span>
				<span className={styles.score}>{score.toLocaleString()} б.</span>
			</div>

			{/* Physical podium block / pillar */}
			<div
				className={`${styles.pillar} ${isRevealed ? styles.pillarRevealed : ''}`}
				aria-hidden="true"
			>
				<span className={styles.placeNumber}>{place}</span>
			</div>
		</div>
	);
}
