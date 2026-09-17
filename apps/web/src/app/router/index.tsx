import { createBrowserRouter } from 'react-router-dom';
import { Layout, TeacherLayout, StudentLayout, ProtectedRoute, PublicRoute } from '../../shared';
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
  ClassesPage,
  ClassDetailsPage,
  CourseDetailsPage,
  StudentDetailsPage,
  ReportsListPage,
  SessionReportPage,
  PublicUserProfilePage,
  StudentDashboardPage,
  StudentClassPage,
  StudentPerformancePage,
  StudentHistoryPage,
  StudentCoursesPage,
  StudentProfilePage,
  StudentResultReportPage,
  StudentClassmateProfilePage,
  GameJoinPage,
  GameHostPage,
  GamePlayPage,
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
  // Game session routes (Player & Guest join)
  { path: '/join', element: <GameJoinPage /> },
  { path: '/game/play/:roomUuid', element: <GamePlayPage /> },
  // Student Result Report route
  { path: '/student/results/:uuid', element: <StudentResultReportPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      // Teacher Portal routes
      {
        element: <TeacherLayout />,
        children: [
          { path: '/dashboard', element: <TeacherMainPage /> },
          { path: '/classes', element: <ClassesPage /> },
          { path: '/classes/:uuid', element: <ClassDetailsPage /> },
          { path: '/classes/:classUuid/courses/:courseUuid', element: <CourseDetailsPage /> },
          { path: '/classes/:classUuid/students/:studentUuid', element: <StudentDetailsPage /> },
          { path: '/library', element: <LibraryPage /> },
          { path: '/profile', element: <ProfilePage /> },
          { path: '/quiz/:uuid', element: <QuizDetailsPage /> },
          { path: '/users/:uuid', element: <PublicUserProfilePage /> },
          { path: '/dashboard/reports', element: <ReportsListPage /> },
          { path: '/dashboard/reports/:roomUuid', element: <SessionReportPage /> },
        ],
      },
      // Student Portal routes
      {
        element: <StudentLayout />,
        children: [
          { path: '/student', element: <StudentDashboardPage /> },
          { path: '/student/dashboard', element: <StudentDashboardPage /> },
          { path: '/student/class', element: <StudentClassPage /> },
          { path: '/student/classmates/:uuid', element: <StudentClassmateProfilePage /> },
          { path: '/student/class/classmates/:uuid', element: <StudentClassmateProfilePage /> },
          { path: '/student/performance', element: <StudentPerformancePage /> },
          { path: '/student/history', element: <StudentHistoryPage /> },
          { path: '/student/courses', element: <StudentCoursesPage /> },
          { path: '/student/profile', element: <StudentProfilePage /> },
        ],
      },
      // Teacher Host Live Session
      { path: '/game/host/:roomUuid', element: <GameHostPage /> },
      // Drafts Hub — select or create drafts (separate layout)
      { path: '/quiz/drafts', element: <QuizDraftsPage /> },
      // Quiz Editor — separate layout (no TeacherLayout sidebar/topbar)
      { path: '/quiz/:uuid/edit', element: <QuizEditorPage /> },
    ],
  },
  // 404 Catch-all route
  { path: '/not-found', element: <NotFoundPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
