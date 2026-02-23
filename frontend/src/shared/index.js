/**
 * Shared Layer Index
 * 
 * Exports all shared modules used across features.
 * The shared layer contains reusable UI, hooks, utilities, and types.
 * 
 * Architecture Rules:
 * - No business logic allowed
 * - Must remain framework-agnostic when possible
 * - Used by multiple features
 * 
 * @module shared
 */

// UI Components
export * from './ui/index.js';

// Hooks
export * from './hooks/index.js';

// Utilities
export * from './utils/index.js';

// Types
export * from './types/index.js';

// Contracts (for cross-feature communication)
export * from './contracts/index.js';

// Events (for cross-feature communication)
export * from './events/index.js';
