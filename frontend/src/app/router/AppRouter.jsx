/**
 * App Layer - Router
 * 
 * Application router configuration and initialization.
 * Only wiring and composition logic - no business logic.
 * 
 * @module app/router
 */

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Import layout components
import AppLayout from '../../components/layout/AppLayout/AppLayout.jsx';
import AppShell from '../../components/layout/AppShell/AppShell.jsx';

// Import route configuration
import { routes, authGuard, guestGuard, evaluateGuards } from '../../core/router/index.js';

// Import feature routes
import { getTaskRoutes } from '../../features/tasks/routes/index.js';

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    Loading...
  </div>
);

/**
 * Error boundary component
 */
const ErrorBoundary = lazy(() => import('../../pages/ErrorPages.jsx'));

/**
 * Lazy loaded pages
 */
const LandingPage = lazy(() => import('../../pages/Landing.jsx'));
const LoginPage = lazy(() => import('../../pages/Login.jsx'));
const RegisterPage = lazy(() => import('../../pages/Register.jsx'));
const ForgotPasswordPage = lazy(() => import('../../pages/ForgotPassword.jsx'));
const ResetPasswordPage = lazy(() => import('../../pages/ResetPassword.jsx'));
const DashboardPage = lazy(() => import('../../pages/Dashboard.jsx'));
const TaskListPage = lazy(() => import('../../pages/TaskList.jsx'));
const TaskDetailsPage = lazy(() => import('../../pages/TaskDetails.jsx'));
const TaskFormPage = lazy(() => import('../../pages/TaskForm.jsx'));
const CalendarPage = lazy(() => import('../../pages/Calendar.jsx'));
const NotificationsPage = lazy(() => import('../../pages/Notifications.jsx'));
const SettingsPage = lazy(() => import('../../pages/Settings.jsx'));
const ProfilePage = lazy(() => import('../../pages/Profile.jsx'));

/**
 * Protected route wrapper
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * Guest route wrapper (only accessible when not logged in)
 */
function GuestRoute({ children }) {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

/**
 * Route configuration
 */
const routerConfig = [
  // Public routes
  {
    path: '/',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <Suspense fallback={<LoadingFallback />}>
          <RegisterPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <GuestRoute>
        <Suspense fallback={<LoadingFallback />}>
          <ForgotPasswordPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  {
    path: '/reset-password/:token',
    element: (
      <GuestRoute>
        <Suspense fallback={<LoadingFallback />}>
          <ResetPasswordPage />
        </Suspense>
      </GuestRoute>
    ),
  },
  
  // Protected routes with layout
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: '/tasks',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TaskListPage />
          </Suspense>
        ),
      },
      {
        path: '/tasks/:taskId',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TaskDetailsPage />
          </Suspense>
        ),
      },
      {
        path: '/tasks/new',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TaskFormPage />
          </Suspense>
        ),
      },
      {
        path: '/tasks/:taskId/edit',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TaskFormPage />
          </Suspense>
        ),
      },
      {
        path: '/calendar',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CalendarPage />
          </Suspense>
        ),
      },
      {
        path: '/notifications',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotificationsPage />
          </Suspense>
        ),
      },
      {
        path: '/settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: '/profile',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },
  
  // Error routes
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary />
      </Suspense>
    ),
  },
];

/**
 * Create router instance
 */
const router = createBrowserRouter(routerConfig);

/**
 * App Router Component
 */
function AppRouter() {
  return <RouterProvider router={router} />;
}

export { AppRouter, router, routerConfig };
export default AppRouter;
