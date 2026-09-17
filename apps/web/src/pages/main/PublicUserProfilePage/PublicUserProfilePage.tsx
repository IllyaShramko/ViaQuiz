import { useParams, useNavigate } from 'react-router-dom';
import { useGetPublicProfileQuery, ProfileHeaderCard, ProfileStatsGrid } from '../../../modules/profile';
import { QuizCard } from '../../../modules/home/ui/quizzes/QuizCard';
import type { PublicQuizSummary } from '../../../modules/home/models';
import { useTeacherHeader } from '../../../shared';
import type { PublicUserProfilePageProps } from './PublicUserProfilePage.types';
import styles from './PublicUserProfilePage.module.css';

export function PublicUserProfilePage({ className }: PublicUserProfilePageProps) {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetPublicProfileQuery(uuid || '', {
    skip: !uuid,
  });

  useTeacherHeader({
    title: 'Профіль',
    showBack: true,
    backTo: () => navigate(-1),
    backLabel: 'Назад',
  });

  const user = data?.user;

  if (isLoading) {
    return (
      <div className={`${styles['public-profile-page']} ${className || ''}`}>
        <div className={styles['loading-state']}>Завантаження профілю...</div>
      </div>
    );
  }

  if (isError || !data || !user) {
    return (
      <div className={`${styles['public-profile-page']} ${className || ''}`}>
        <div className={styles['error-state']}>
          <h3>Користувача не знайдено</h3>
          <p>Не вдалося знайти публічний профіль за цим посиланням.</p>
        </div>
      </div>
    );
  }

  const quizzes = data.quizzes || [];

  return (
    <div className={`${styles['public-profile-page']} ${className || ''}`}>
      {/* Profile Header */}
      <ProfileHeaderCard
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          login: user.login,
          createdAt: user.createdAt,
        }}
        roleLabel={user.role === 'ADMIN' ? 'Адміністратор' : 'Викладач'}
      />

      {/* Stats Grid */}
      <ProfileStatsGrid
        totalQuizzes={data.stats.totalQuizzes}
        activeClassesCount={0}
        gamesCount={data.stats.gamesCount}
        isLoading={false}
      />

      {/* Quizzes Created by User */}
      <section className={styles['quizzes-section']}>
        <h3 className={styles['quizzes-section__title']}>
          Створені вікторини ({quizzes.length})
        </h3>

        {quizzes.length > 0 ? (
          <div className={styles['quizzes-grid']}>
            {quizzes.map((quiz: PublicQuizSummary, index: number) => (
              <QuizCard
                key={quiz.uuid || quiz.id}
                quiz={quiz}
                index={index}
                onClick={(selected) => navigate(`/quiz/${selected.uuid}`)}
              />
            ))}
          </div>
        ) : (
          <div className={styles['empty-quizzes']}>
            Цей користувач ще не опублікував жодної вікторини.
          </div>
        )}
      </section>
    </div>
  );
}
