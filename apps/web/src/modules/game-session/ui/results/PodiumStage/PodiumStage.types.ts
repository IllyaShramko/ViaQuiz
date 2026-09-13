import type { ParticipantDto } from '@viaquiz/shared-types';

export interface PodiumStageProps {
	/** Top 3 participants sorted descending by score */
	topThree: ParticipantDto[];
	/** Set of revealed place numbers from usePodiumAnimation */
	revealedPlaces: Set<number>;
}
