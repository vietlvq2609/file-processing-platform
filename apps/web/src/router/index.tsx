import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import FileDetailPage from '../pages/FileDetailPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/files/:id',
    element: (
      <ProtectedRoute>
        <FileDetailPage />
      </ProtectedRoute>
    ),
  },
]);
