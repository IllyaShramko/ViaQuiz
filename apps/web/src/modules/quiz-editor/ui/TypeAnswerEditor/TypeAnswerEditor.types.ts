import type { EditorVariant } from '../../models';

export interface TypeAnswerEditorProps {
  variants: EditorVariant[];
  answerType: 'TYPE_ANSWER_V1' | 'TYPE_ANSWER_V2';
  onChange: (variants: EditorVariant[]) => void;
}
