/**
 * Features Layer Index
 * 
 * Main entry point for all features.
 * Each feature is self-contained and exports its own modules.
 * 
 * Architecture Rules:
 * - Feature logic must not leak outside its boundary
 * - Features communicate through shared abstractions only
 * - API calls related to a feature stay inside that feature
 * - Avoid cross-feature direct imports
 * 
 * @module features
 */

// Tasks Feature
export * from './tasks/index.js';

// Projects Feature
export * from './projects/index.js';

// Notifications Feature
export * from './notifications/index.js';

// Settings Feature
export * from './settings/index.js';
