import type { QuestionType } from '../../models';

export interface QuestionTypeSelectorProps {
  onSelect: (type: QuestionType) => void;
}
