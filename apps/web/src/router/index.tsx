import { createBrowserRouter, Navigate } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import FileDetailPage from '../pages/FileDetailPage'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/files/:id', element: <FileDetailPage /> },
])
