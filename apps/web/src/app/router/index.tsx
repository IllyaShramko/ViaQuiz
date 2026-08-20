import { createBrowserRouter } from 'react-router-dom';
import { Layout, TeacherLayout, ProtectedRoute, PublicRoute } from '../../shared';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  TeacherMainPage,
  ProfilePage,
  QuizDetailsPage,
  QuizEditorPage,
  QuizDraftsPage,
  LibraryPage,
  NotFoundPage,
} from '../../pages';

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <HomePage /> },
        ],
      },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <TeacherLayout />,
        children: [
          { path: '/dashboard', element: <TeacherMainPage /> },
          { path: '/library', element: <LibraryPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/quiz/:uuid', element: <QuizDetailsPage /> },
        ],
      },
      // Drafts Hub — select or create drafts (separate layout)
      { path: '/quiz/drafts', element: <QuizDraftsPage /> },
      // Quiz Editor — separate layout (no TeacherLayout sidebar/topbar)
      { path: '/quiz/:uuid/edit', element: <QuizEditorPage /> },
    ],
  },
  // 404 Catch-all route
  { path: '*', element: <NotFoundPage /> },
]);
