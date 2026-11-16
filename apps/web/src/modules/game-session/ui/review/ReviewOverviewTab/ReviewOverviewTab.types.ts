import type { GameQuestionDto, GameReviewDataDto } from '@viaquiz/shared-types';

export interface ReviewOverviewTabProps {
	question: Pick<GameQuestionDto, 'text' | 'media' | 'type' | 'variants'>;
	reviewData: Pick<
		GameReviewDataDto,
		'answersDistribution' | 'correctVariantIds' | 'correctTextAnswers'
	>;
	participantsCount: number;
	onOpenImage: (url: string) => void;
}
