import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '../components/layout';
import RouteErrorPage from '../components/RouteErrorPage';
import CompressorPage from '../features/compressor/pages/CompressorPage';
import ConverterPage from '../features/converter/pages/ConverterPage';
import ToolsPage from '../features/tools/pages/ToolsPage';
import DashboardPage from '../pages/DashboardPage';
import FileDetailPage from '../pages/FileDetailPage';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'login', element: <LoginPage /> },
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          {
            path: 'files/:id',
            errorElement: <RouteErrorPage />,
            element: <FileDetailPage />,
          },
          { path: 'converter', element: <ConverterPage /> },
          { path: 'compressor', element: <CompressorPage /> },
          { path: 'tools', element: <ToolsPage /> },
        ],
      },
    ],
  },
]);
