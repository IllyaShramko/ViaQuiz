import type { EditorQuestion, QuestionType } from '../../models';

export interface QuestionSettingsProps {
  question: EditorQuestion;
  onUpdate: (
    data: Partial<{
      type: QuestionType;
      timeLimit: number;
      points: number;
    }>,
  ) => void;
  onSave?: () => void;
}
