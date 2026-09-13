import type { ParticipantDto } from '@viaquiz/shared-types';

export interface LeaderboardListProps {
	/** Participants to display (starting from 4th place onwards) */
	participants: ParticipantDto[];
	/** Starting rank position (default: 4) */
	startRank?: number;
	/** Whether the list should be visible */
	isVisible: boolean;
	/** Total questions count for calculating grade */
	totalQuestions: number;
}
