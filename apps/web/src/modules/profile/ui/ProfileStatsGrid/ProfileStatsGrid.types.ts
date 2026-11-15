export interface ProfileStatsGridProps {
  totalQuizzes: number;
  activeClassesCount?: number;
  gamesCount?: number;
  quizzesHref?: string;
  classesHref?: string;
  gamesHref?: string;
  isLoadingQuizzes?: boolean;
  isLoadingClasses?: boolean;
  isLoadingGames?: boolean;
  isLoading?: boolean;
}
