import type { GameQuestionDto } from '@viaquiz/shared-types';

export interface QuestionHostViewProps {
  question: GameQuestionDto;
  questionIndex: number;
  totalQuestions: number;
}
