export {
  quizDetailsApi,
  useGetQuizByUuidQuery,
  useGetQuizByIdQuery,
  useToggleLikeMutation,
  useRecordViewMutation,
} from './api';

export type {
  QuizDetail,
  QuizQuestion,
  QuestionVariant,
  QuizAuthor,
  Keyword,
} from './models';

export {
  QuizBackButton,
  QuizDetailsHero,
  QuizQuestionCard,
  QuizQuestionsList,
  QuizDetailsSkeleton,
  QuizDetailsError,
  QuizLaunchCard,
  DEFAULT_QUIZ_HERO_GRADIENT,
  type QuizBackButtonProps,
  type QuizDetailsHeroProps,
  type QuizQuestionCardProps,
  type QuizQuestionsListProps,
  type QuizDetailsErrorProps,
  type QuizLaunchCardProps,
} from './ui';

