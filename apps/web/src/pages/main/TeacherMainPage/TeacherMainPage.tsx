import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetPublishedQuizzesQuery,
  TeacherHeroSearch,
  TeacherQuizzesHeader,
  TeacherQuizzesGrid,
  TeacherPagination,
} from '../../../modules/dashboard';
import styles from '../../../modules/dashboard/ui/Dashboard.module.css';

export function TeacherMainPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching, isError, refetch } = useGetPublishedQuizzesQuery({
    search: debouncedSearch || undefined,
    page,
    limit,
  });

  const isDebouncing = searchTerm !== debouncedSearch;
  const isGridLoading = isLoading || isFetching || isDebouncing;

  const quizzes = data?.quizzes || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleCardClick = (uuid: string) => {
    navigate(`/quiz/${uuid}`);
  };

  return (
    <div className={styles['teacher-main-page']}>
      <TeacherHeroSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClear={() => setSearchTerm('')}
      />

      <TeacherQuizzesHeader total={total} />

      <TeacherQuizzesGrid
        quizzes={quizzes}
        isLoading={isGridLoading}
        isError={isError}
        onCardClick={handleCardClick}
        onRetry={refetch}
      />

      <TeacherPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
