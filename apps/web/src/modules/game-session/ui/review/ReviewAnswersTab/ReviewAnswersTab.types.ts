import type {
	GameQuestionDto,
	GameReviewDataDto,
	ParticipantDto,
} from '@viaquiz/shared-types';

export interface ReviewAnswersTabProps {
	participants: ParticipantDto[];
	participantAnswers?: GameReviewDataDto['participantAnswers'];
	variants: GameQuestionDto['variants'];
	correctVariantIds: GameReviewDataDto['correctVariantIds'];
}
