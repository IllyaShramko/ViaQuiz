export type PodiumPlace = 1 | 2 | 3;

export interface PodiumColumnProps {
	/** Placement on the podium (1, 2, or 3) */
	place: PodiumPlace;
	/** Participant nickname */
	nickname: string;
	/** Total participant score */
	score: number;
	/** Whether this podium column has been revealed by the animation sequence */
	isRevealed: boolean;
}
