import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetMyLibraryQuizzesQuery,
  useGetLikedLibraryQuizzesQuery,
  useDeleteLibraryQuizMutation,
  useToggleLibraryLikeMutation,
  LibraryHeader,
  LibraryTabs,
  LibraryToolbar,
  LibraryGrid,
  type LibraryTab,
  type LibrarySortBy,
  type LibrarySortOrder,
} from '../../../modules/library';
import { TeacherPagination } from '../../../modules/dashboard';
import { useTeacherHeader } from '../../../shared';
import styles from '../../../modules/library/ui/Library.module.css';

export function LibraryPage() {
  useTeacherHeader({ title: 'Бібліотека' });
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<LibraryTab>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<LibrarySortBy>('updatedAt');
  const [sortOrder, setSortOrder] = useState<LibrarySortOrder>('desc');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when tab changes
  const handleTabChange = (tab: LibraryTab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchTerm('');
    setDebouncedSearch('');
  };

  const handleSortByChange = (newSortBy: LibrarySortBy) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handleToggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    setPage(1);
  };

  // Queries
  const myQuery = useGetMyLibraryQuizzesQuery(
    {
      search: debouncedSearch || undefined,
      page,
      limit,
      sortBy,
      sortOrder,
    },
    { skip: activeTab !== 'my' }
  );

  const likedQuery = useGetLikedLibraryQuizzesQuery(
    {
      search: debouncedSearch || undefined,
      page,
      limit,
      sortBy,
      sortOrder,
    },
    { skip: activeTab !== 'liked' }
  );

  // Background counts for tabs
  const myCountQuery = useGetMyLibraryQuizzesQuery({ limit: 1 }, { skip: activeTab === 'my' });
  const likedCountQuery = useGetLikedLibraryQuizzesQuery({ limit: 1 }, { skip: activeTab === 'liked' });

  const [deleteQuiz] = useDeleteLibraryQuizMutation();
  const [toggleLike] = useToggleLibraryLikeMutation();

  const myTotal = activeTab === 'my' ? myQuery.data?.total || 0 : myCountQuery.data?.total || 0;
  const likedTotal = activeTab === 'liked' ? likedQuery.data?.total || 0 : likedCountQuery.data?.total || 0;

  const currentQuery = activeTab === 'my' ? myQuery : likedQuery;
  const quizzes = currentQuery.data?.quizzes || [];
  const currentTotal = currentQuery.data?.total || 0;
  const totalPages = Math.ceil(currentTotal / limit);

  const isDebouncing = searchTerm !== debouncedSearch;
  const isLoading = currentQuery.isLoading || currentQuery.isFetching || isDebouncing;

  const handleCardClick = (uuid: string) => {
    const quiz = quizzes.find((q) => q.uuid === uuid);
    if (quiz && 'isDraft' in quiz && quiz.isDraft) {
      navigate(`/quiz/${uuid}/edit`);
    } else {
      navigate(`/quiz/${uuid}`);
    }
  };

  const handleEdit = (uuid: string) => {
    navigate(`/quiz/${uuid}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm('Ви впевнені, що хочете видалити цю вікторину?')) return;

    try {
      await deleteQuiz(id).unwrap();
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  const handleUnlike = async (e: React.MouseEvent, uuid: string) => {
    e.stopPropagation();
    try {
      await toggleLike(uuid).unwrap();
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  return (
    <div className={styles['library-page']}>
      <LibraryHeader onCreateQuiz={() => navigate('/quiz/drafts')} />

      <LibraryTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        myTotal={myTotal}
        likedTotal={likedTotal}
      />

      <LibraryToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        sortOrder={sortOrder}
        onToggleSortOrder={handleToggleSortOrder}
        isLikedTab={activeTab === 'liked'}
      />

      <LibraryGrid
        quizzes={quizzes}
        isLoading={isLoading}
        isError={currentQuery.isError}
        isLikedTab={activeTab === 'liked'}
        hasSearch={Boolean(debouncedSearch)}
        onCardClick={handleCardClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUnlike={handleUnlike}
        onCreateQuiz={() => navigate('/quiz/drafts')}
        onExplore={() => navigate('/dashboard')}
        onRetry={currentQuery.refetch}
      />

      <TeacherPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
