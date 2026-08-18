export {
  quizDetailsApi,
  useGetQuizByUuidQuery,
  useGetQuizByIdQuery,
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
  DEFAULT_QUIZ_HERO_GRADIENT,
  type QuizBackButtonProps,
  type QuizDetailsHeroProps,
  type QuizQuestionCardProps,
  type QuizQuestionsListProps,
  type QuizDetailsErrorProps,
} from './ui';
