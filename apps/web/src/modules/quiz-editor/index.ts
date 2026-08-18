export {
  quizEditorApi,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  usePublishQuizMutation,
  useDeleteQuizMutation,
  useGetQuizForEditorQuery,
  useGetMyDraftsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useDuplicateQuestionMutation,
  useReorderQuestionsMutation,
  useUploadImageMutation,
} from './api/quizEditorApi';

export type {
  QuestionType,
  VariantType,
  EditorVariant,
  EditorQuestion,
  EditorQuiz,
  CreateQuizPayload,
  UpdateQuizPayload,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  ReorderPayload,
  PublishValidationError,
  PublishErrorResponse,
  SaveStatus,
} from './models/types';

export { useAutoSave } from './hooks/useAutoSave';
export { QuizEditorLayout } from './ui/QuizEditorLayout/QuizEditorLayout';
export { PublishModal } from './ui/PublishModal/PublishModal';
