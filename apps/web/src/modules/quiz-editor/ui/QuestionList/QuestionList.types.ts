import type { EditorQuestion } from '../../models';

export interface QuestionListProps {
  questions: EditorQuestion[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onReorder: (questionIds: number[]) => void;
}

export interface SortableItemProps {
  question: EditorQuestion;
  index: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
}
