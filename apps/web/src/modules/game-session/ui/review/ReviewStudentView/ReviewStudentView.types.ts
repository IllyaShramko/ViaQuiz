import type {
  GameQuestionDto,
  GameReviewDataDto,
} from '@viaquiz/shared-types';

export interface ReviewStudentViewProps {
  question: GameQuestionDto;
  reviewData: GameReviewDataDto;
}
