import type { GameQuestionDto } from '@viaquiz/shared-types';

export interface QuestionStudentViewProps {
  question: GameQuestionDto;
  alreadyAnswered: boolean;
  onSubmitAnswer: (variantIds?: number[], typedAnswer?: string) => void;
}
