/**
 * Teams Feature Module
 * 
 * Main entry point for the Teams feature.
 */

// Pages
export { default as TeamDashboard } from './pages/TeamDashboard';
export { default as TeamDetails } from './pages/TeamDetails';
export { default as TeamSettings } from './pages/TeamSettings';

// Components
export * from './components';

// Store
export { default as useTeamStore } from './store/teamStore';

// Services
export { default as teamService } from './services/teamService';

// Routes
export { teamRoutes } from './routes';

// Types
export * from './types';
