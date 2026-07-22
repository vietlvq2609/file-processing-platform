import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import FileDetailPage from '../pages/FileDetailPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';
import RouteErrorPage from '../components/RouteErrorPage';

export const router = createBrowserRouter([
  {
    // Root catch-all: any error that bubbles past a more specific errorElement
    // (or occurs on a route without one) is caught here.
    path: '/',
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'files/:id',
        // Closest errorElement wins — useRequiredParam throws are caught here
        // before bubbling to the root, keeping the same friendly UI either way.
        errorElement: <RouteErrorPage />,
        element: (
          <ProtectedRoute>
            <FileDetailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
