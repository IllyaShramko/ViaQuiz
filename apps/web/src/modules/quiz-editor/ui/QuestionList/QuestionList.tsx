import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { EditorQuestion } from '../../models/types';
import { OneAnswerIcon, MultipleIcon, EnterIcon, BinIcon, PlusIcon } from '../../../../shared';
import './QuestionList.css';

interface QuestionListProps {
  questions: EditorQuestion[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onReorder: (questionIds: number[]) => void;
}

interface SortableItemProps {
  question: EditorQuestion;
  index: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
}

const restrictToVerticalAxis: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: 0,
  };
};

const SortableQuestionItem: React.FC<SortableItemProps> = ({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: question.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, x: 0, scaleX: 1, scaleY: 1 } : null
    ),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ONE_ANSWER': return <OneAnswerIcon width={16} height={16} />;
      case 'MANY_ANSWERS': return <MultipleIcon width={16} height={16} />;
      case 'TYPE_ANSWER_V1': return <EnterIcon width={16} height={16} />;
      case 'TYPE_ANSWER_V2': return <EnterIcon width={16} height={16} />;
      default: return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`question-list-item ${isSelected ? 'selected' : ''} ${isDragging ? 'is-dragging' : ''}`}
      onClick={() => onSelect(question.id)}
    >
      <div className="question-list-item-drag-handle" {...attributes} {...listeners}>
        ≡
      </div>
      <div className="question-list-item-content">
        <div className="question-list-item-header">
          <span className="question-list-item-number">{index + 1}.</span>
          <span className="question-list-item-icon">{getTypeIcon(question.type)}</span>
        </div>
        <div className="question-list-item-text">
          {question.text ? (question.text.length > 30 ? question.text.substring(0, 30) + '...' : question.text) : 'Нове питання'}
        </div>
      </div>
      <div className="question-list-item-actions">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDuplicate(question.id); }}
          title="Дублювати"
          aria-label="Дублювати"
        >
          ⎘
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
          title="Видалити"
          aria-label="Видалити"
        >
          <BinIcon width={14} height={14} />
        </button>
      </div>
    </div>
  );
};

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onReorder
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex(q => q.id === active.id);
      const newIndex = questions.findIndex(q => q.id === over.id);

      const newQuestions = [...questions];
      const [moved] = newQuestions.splice(oldIndex, 1);
      newQuestions.splice(newIndex, 0, moved);

      onReorder(newQuestions.map(q => q.id));
    }
  };

  return (
    <aside className="question-list-sidebar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <div className="question-list-items">
          <SortableContext
            items={questions.map(q => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((q, i) => (
              <SortableQuestionItem
                key={q.id}
                question={q}
                index={i}
                isSelected={q.id === selectedId}
                onSelect={onSelect}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
      
      <div className="question-list-footer">
        <button type="button" className="add-question-btn" onClick={onAdd}>
          <PlusIcon width={16} height={16} />
          <span>Додати питання</span>
        </button>
      </div>
    </aside>
  );
};
