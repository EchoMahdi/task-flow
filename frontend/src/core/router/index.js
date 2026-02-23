/**
 * Core Router Module
 * 
 * Foundation routing infrastructure for the application.
 * Provides route configuration, guards, and navigation utilities.
 * 
 * @module core/router
 */

import { lazy, Suspense } from 'react';

/**
 * Route configuration structure
 */
const routes = {
  /**
   * Public routes (no authentication required)
   */
  public: [
    {
      path: '/',
      element: 'Landing',
      lazy: () => import('../../pages/Landing.jsx'),
    },
    {
      path: '/login',
      element: 'Login',
      lazy: () => import('../../pages/Login.jsx'),
    },
    {
      path: '/register',
      element: 'Register',
      lazy: () => import('../../pages/Register.jsx'),
    },
    {
      path: '/forgot-password',
      element: 'ForgotPassword',
      lazy: () => import('../../pages/ForgotPassword.jsx'),
    },
    {
      path: '/reset-password/:token',
      element: 'ResetPassword',
      lazy: () => import('../../pages/ResetPassword.jsx'),
    },
  ],

  /**
   * Protected routes (authentication required)
   */
  protected: [
    {
      path: '/dashboard',
      element: 'Dashboard',
      lazy: () => import('../../pages/Dashboard.jsx'),
    },
    {
      path: '/tasks',
      element: 'TaskList',
      lazy: () => import('../../pages/TaskList.jsx'),
    },
    {
      path: '/tasks/:taskId',
      element: 'TaskDetails',
      lazy: () => import('../../pages/TaskDetails.jsx'),
    },
    {
      path: '/tasks/new',
      element: 'TaskForm',
      lazy: () => import('../../pages/TaskForm.jsx'),
    },
    {
      path: '/calendar',
      element: 'Calendar',
      lazy: () => import('../../pages/Calendar.jsx'),
    },
    {
      path: '/notifications',
      element: 'Notifications',
      lazy: () => import('../../pages/Notifications.jsx'),
    },
    {
      path: '/settings',
      element: 'Settings',
      lazy: () => import('../../pages/Settings.jsx'),
    },
    {
      path: '/profile',
      element: 'Profile',
      lazy: () => import('../../pages/Profile.jsx'),
    },
  ],

  /**
   * Error routes
   */
  error: [
    {
      path: '*',
      element: 'NotFound',
      lazy: () => import('../../pages/ErrorPages.jsx'),
    },
  ],
};

/**
 * Navigation guard types
 */
const GuardTypes = {
  AUTH: 'auth',
  GUEST: 'guest',
  ROLE: 'role',
  PERMISSION: 'permission',
  FEATURE: 'feature',
};

/**
 * Create a navigation guard
 * @param {string} type - Guard type
 * @param {Function} condition - Condition function
 * @param {string|Function} redirect - Redirect path or function
 * @returns {Object} Guard object
 */
function createGuard(type, condition, redirect) {
  return {
    type,
    condition,
    redirect: typeof redirect === 'function' ? redirect : () => redirect,
  };
}

/**
 * Auth guard - requires authentication
 */
const authGuard = createGuard(
  GuardTypes.AUTH,
  (context) => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },
  '/login'
);

/**
 * Guest guard - requires no authentication
 */
const guestGuard = createGuard(
  GuardTypes.GUEST,
  (context) => {
    const token = localStorage.getItem('auth_token');
    return !token;
  },
  '/dashboard'
);

/**
 * Role guard factory
 * @param {string[]} roles - Required roles
 * @returns {Object} Guard object
 */
function roleGuard(roles) {
  return createGuard(
    GuardTypes.ROLE,
    (context) => {
      const userRoles = context.user?.roles || [];
      return roles.some((role) => userRoles.includes(role));
    },
    '/dashboard'
  );
}

/**
 * Feature guard factory
 * @param {string} feature - Required feature flag
 * @returns {Object} Guard object
 */
function featureGuard(feature) {
  return createGuard(
    GuardTypes.FEATURE,
    (context) => {
      return context.features?.[feature] !== false;
    },
    '/dashboard'
  );
}

/**
 * Evaluate guards for a route
 * @param {Object[]} guards - Array of guards
 * @param {Object} context - Guard context
 * @returns {Object|null} Redirect info or null if allowed
 */
function evaluateGuards(guards, context) {
  for (const guard of guards) {
    if (!guard.condition(context)) {
      return {
        redirect: guard.redirect(context),
        reason: guard.type,
      };
    }
  }
  return null;
}

/**
 * Navigation utilities
 */
const Navigation = {
  /**
   * Navigate to a path
   * @param {string} path - Target path
   * @param {Object} options - Navigation options
   */
  navigate(path, options = {}) {
    const { replace = false, state = {} } = options;
    
    if (replace) {
      window.history.replaceState(state, '', path);
    } else {
      window.history.pushState(state, '', path);
    }
    
    // Dispatch popstate event for router to pick up
    window.dispatchEvent(new PopStateEvent('popstate', { state }));
  },

  /**
   * Go back in history
   */
  back() {
    window.history.back();
  },

  /**
   * Go forward in history
   */
  forward() {
    window.history.forward();
  },

  /**
   * Get current path
   * @returns {string}
   */
  getCurrentPath() {
    return window.location.pathname;
  },

  /**
   * Get query parameters
   * @returns {URLSearchParams}
   */
  getQueryParams() {
    return new URLSearchParams(window.location.search);
  },

  /**
   * Build URL with query params
   * @param {string} path - Base path
   * @param {Object} params - Query parameters
   * @returns {string}
   */
  buildUrl(path, params = {}) {
    const url = new URL(path, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    return url.pathname + url.search;
  },
};

/**
 * Create lazy loaded route element
 * @param {Function} loader - Dynamic import function
 * @param {React.ReactNode} fallback - Loading fallback
 * @returns {React.ReactNode}
 */
function lazyRoute(loader, fallback = null) {
  const LazyComponent = lazy(loader);
  
  return (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

/**
 * Route constants
 */
const RouteNames = {
  HOME: 'home',
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  TASKS: 'tasks',
  TASK_DETAILS: 'taskDetails',
  TASK_NEW: 'taskNew',
  CALENDAR: 'calendar',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  PROFILE: 'profile',
  FORGOT_PASSWORD: 'forgotPassword',
  RESET_PASSWORD: 'resetPassword',
};

/**
 * Get route path by name
 * @param {string} name - Route name
 * @param {Object} params - Route parameters
 * @returns {string}
 */
function getRoutePath(name, params = {}) {
  const routeMap = {
    [RouteNames.HOME]: '/',
    [RouteNames.LOGIN]: '/login',
    [RouteNames.REGISTER]: '/register',
    [RouteNames.DASHBOARD]: '/dashboard',
    [RouteNames.TASKS]: '/tasks',
    [RouteNames.TASK_DETAILS]: '/tasks/:taskId',
    [RouteNames.TASK_NEW]: '/tasks/new',
    [RouteNames.CALENDAR]: '/calendar',
    [RouteNames.NOTIFICATIONS]: '/notifications',
    [RouteNames.SETTINGS]: '/settings',
    [RouteNames.PROFILE]: '/profile',
    [RouteNames.FORGOT_PASSWORD]: '/forgot-password',
    [RouteNames.RESET_PASSWORD]: '/reset-password/:token',
  };

  let path = routeMap[name] || '/';
  
  // Replace parameters
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  
  return path;
}

export {
  routes,
  GuardTypes,
  createGuard,
  authGuard,
  guestGuard,
  roleGuard,
  featureGuard,
  evaluateGuards,
  Navigation,
  lazyRoute,
  RouteNames,
  getRoutePath,
};

export default routes;
