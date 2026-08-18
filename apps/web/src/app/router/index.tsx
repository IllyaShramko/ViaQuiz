import { createBrowserRouter } from 'react-router-dom';
import { Layout, TeacherLayout, ProtectedRoute, PublicRoute } from '../../shared';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  TeacherMainPage,
  ProfilePage,
  QuizDetailsPage,
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
          { path: '/profile', element: <ProfilePage /> },
          { path: '/quiz/:uuid', element: <QuizDetailsPage /> },
        ],
      },
    ],
  },
]);
