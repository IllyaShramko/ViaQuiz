import type { EditorQuestion, EditorVariant, QuestionType } from '../../models';

export interface QuestionEditorProps {
  question: EditorQuestion;
  onUpdate: (
    data: Partial<{
      text: string;
      media: string | null;
      type: QuestionType;
      timeLimit: number;
      points: number;
      variants: EditorVariant[];
    }>,
  ) => void;
  onSave?: () => void;
}
