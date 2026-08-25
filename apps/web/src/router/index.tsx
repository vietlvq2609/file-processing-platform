import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout, PublicLayout } from '../components/layout';
import RouteErrorPage from '../components/RouteErrorPage';
import CompressorPage from '../features/compressor/pages/CompressorPage';
import ConverterPage from '../features/converter/pages/ConverterPage';
import ToolsPage from '../features/tools/pages/ToolsPage';
import DashboardPage from '../pages/DashboardPage';
import FileDetailPage from '../pages/FileDetailPage';
import FilesPage from '../pages/FilesPage';
import JobsPage from '../pages/JobsPage';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import SettingsPage from '../pages/SettingsPage';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <PublicLayout />,
        children: [{ index: true, element: <LandingPage /> }],
      },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      // Legacy redirects for old paths
      { path: 'dashboard', element: <Navigate to="/app/dashboard" replace /> },
      { path: 'converter', element: <Navigate to="/app/convert" replace /> },
      { path: 'compressor', element: <Navigate to="/app/compress" replace /> },
      {
        path: 'app',
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'files', element: <FilesPage /> },
          {
            path: 'files/:id',
            errorElement: <RouteErrorPage />,
            element: <FileDetailPage />,
          },
          { path: 'convert', element: <ConverterPage /> },
          { path: 'compress', element: <CompressorPage /> },
          { path: 'tools', element: <ToolsPage /> },
          { path: 'jobs', element: <JobsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
