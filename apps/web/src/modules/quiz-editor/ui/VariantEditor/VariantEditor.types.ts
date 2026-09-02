import type { EditorVariant } from '../../models';

export interface VariantEditorProps {
  variants: EditorVariant[];
  questionType: 'ONE_ANSWER' | 'MANY_ANSWERS';
  onChange: (variants: EditorVariant[]) => void;
}
