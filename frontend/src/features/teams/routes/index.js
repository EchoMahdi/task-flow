/**
 * Team Routes
 * 
 * Frontend routing configuration for the Team feature.
 */

import { lazy } from 'react';

// Lazy load pages for better performance
const TeamDashboard = lazy(() => import('../pages/TeamDashboard'));
const TeamDetails = lazy(() => import('../pages/TeamDetails'));
const TeamSettings = lazy(() => import('../pages/TeamSettings'));

/**
 * Route configuration for teams.
 */
export const teamRoutes = [
  {
    path: '/teams',
    name: 'Teams',
    component: TeamDashboard,
    exact: true,
  },
  {
    path: '/teams/:id',
    name: 'Team Details',
    component: TeamDetails,
  },
  {
    path: '/teams/:id/settings',
    name: 'Team Settings',
    component: TeamSettings,
  },
];

export default teamRoutes;
