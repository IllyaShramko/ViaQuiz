import type { GameReviewDataDto } from '@viaquiz/shared-types';

export interface ReviewStatsCardProps {
	correctVariantIds: GameReviewDataDto['correctVariantIds'];
	answersDistribution: GameReviewDataDto['answersDistribution'];
	participantAnswers?: GameReviewDataDto['participantAnswers'];
	totalParticipantsCount: number;
}
