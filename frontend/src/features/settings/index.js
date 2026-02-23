/**
 * Settings Feature Index
 * 
 * Main entry point for the settings feature.
 * 
 * @module features/settings
 */

// Types
export { SettingsSection, createDefaultPreferences } from './types/index.js';

// Services
export { settingsService, endpoints as settingsEndpoints } from './services/settingsService.js';
