/**
 * Shared UI Components Index
 * 
 * Exports all reusable UI components.
 * These components are used across multiple features.
 * 
 * @module shared/ui
 */

// Button
export { Button, VARIANTS, SIZES } from './Button/index.js';

// Input
export { Input } from './Input/index.js';

// Modal
export { Modal } from './Modal/index.js';

// Re-export existing UI components from the old structure
// These will be gradually migrated to the new structure
export { default as DateDisplay } from '../../components/ui/DateDisplay.jsx';
export { default as JalaliCalendar } from '../../components/ui/JalaliCalendar.jsx';
export { default as LoadingButton } from '../../components/ui/LoadingButton.tsx';
export { default as PageHeader } from '../../components/ui/PageHeader.jsx';
export { default as SearchInput } from '../../components/ui/SearchInput.jsx';
export { default as Toast } from '../../components/ui/Toast.jsx';
export { LanguageSwitcher } from '../../components/ui/LanguageSwitcher/index.js';
