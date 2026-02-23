/**
 * App Layer Index
 * 
 * Main entry point for the application layer.
 * Only wiring and composition logic - no business logic.
 * 
 * Architecture Rules:
 * - Only wiring and composition logic
 * - No business logic
 * - App → Features dependency direction
 * 
 * @module app
 */

// Main App Component
export { App, default } from './App.jsx';

// Providers
export { AppProviders, useAuth, useThemeContext, usePreferences } from './providers/AppProviders.jsx';

// Router
export { AppRouter, router, routerConfig } from './router/AppRouter.jsx';
