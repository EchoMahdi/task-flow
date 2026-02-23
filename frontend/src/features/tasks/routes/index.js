/**
 * Tasks Feature - Routes
 * 
 * Route configuration for the tasks feature.
 * Supports lazy loading for better performance.
 * 
 * @module features/tasks/routes
 */

import { lazy, Suspense } from 'react';
import { authGuard } from '@/core/router/index.js';

/**
 * Lazy loaded task pages
 */
const TaskListPage = lazy(() => import('@/pages/TaskList.jsx'));
const TaskDetailsPage = lazy(() => import('@/pages/TaskDetails.jsx'));
const TaskFormPage = lazy(() => import('@/pages/TaskForm.jsx'));
const CalendarPage = lazy(() => import('@/pages/Calendar.jsx'));

/**
 * Loading fallback component
 */
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    Loading...
  </div>
);

/**
 * Task routes configuration
 */
const taskRoutes = [
  {
    path: '/tasks',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TaskListPage />
      </Suspense>
    ),
    guards: [authGuard],
    meta: {
      title: 'Tasks',
      description: 'Manage your tasks',
      requiresAuth: true,
    },
  },
  {
    path: '/tasks/:taskId',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TaskDetailsPage />
      </Suspense>
    ),
    guards: [authGuard],
    meta: {
      title: 'Task Details',
      description: 'View task details',
      requiresAuth: true,
    },
  },
  {
    path: '/tasks/new',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TaskFormPage />
      </Suspense>
    ),
    guards: [authGuard],
    meta: {
      title: 'New Task',
      description: 'Create a new task',
      requiresAuth: true,
    },
  },
  {
    path: '/tasks/:taskId/edit',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <TaskFormPage />
      </Suspense>
    ),
    guards: [authGuard],
    meta: {
      title: 'Edit Task',
      description: 'Edit task details',
      requiresAuth: true,
    },
  },
  {
    path: '/calendar',
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CalendarPage />
      </Suspense>
    ),
    guards: [authGuard],
    meta: {
      title: 'Calendar',
      description: 'View tasks in calendar',
      requiresAuth: true,
    },
  },
];

/**
 * Get task routes
 * @returns {Object[]} Task routes
 */
export function getTaskRoutes() {
  return taskRoutes;
}

/**
 * Task route names
 */
export const TaskRouteNames = {
  TASK_LIST: 'tasks',
  TASK_DETAILS: 'taskDetails',
  TASK_NEW: 'taskNew',
  TASK_EDIT: 'taskEdit',
  CALENDAR: 'calendar',
};

/**
 * Get task route path
 * @param {string} name - Route name
 * @param {Object} params - Route parameters
 * @returns {string}
 */
export function getTaskRoutePath(name, params = {}) {
  const paths = {
    [TaskRouteNames.TASK_LIST]: '/tasks',
    [TaskRouteNames.TASK_DETAILS]: `/tasks/${params.taskId || ':taskId'}`,
    [TaskRouteNames.TASK_NEW]: '/tasks/new',
    [TaskRouteNames.TASK_EDIT]: `/tasks/${params.taskId || ':taskId'}/edit`,
    [TaskRouteNames.CALENDAR]: '/calendar',
  };
  
  return paths[name] || '/tasks';
}

export { taskRoutes };
export default taskRoutes;
