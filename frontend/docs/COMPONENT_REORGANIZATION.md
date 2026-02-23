/**
 * ============================================================================
 * Component Reorganization Plan - Feature Isolation Architecture
 * ============================================================================
 * 
 * This document outlines the component classification and migration strategy
 * for implementing feature-based architecture.
 * 
 * ============================================================================
 * COMPONENT CLASSIFICATION
 * ============================================================================
 * 
 * FEATURE-SPECIFIC COMPONENTS (Move to features/{feature}/components):
 * -----------------------------------------------------------------------
 * 
 * Tasks Feature:
 * - components/domain/Task/* (TaskRow, QuickAddBar, TaskList, TaskDetailPanel, TaskPreviewDialog)
 * - components/tasks/* (TaskModal, TaskForm, TaskFilters, TaskCalendar, CalendarTaskItem, CalendarFilters)
 * - pages/TaskList.jsx, TaskDetails.jsx, TaskForm.jsx, Dashboard.jsx, Calendar.jsx
 * 
 * Auth Feature:
 * - pages/Login.jsx, Register.jsx, ForgotPassword.jsx, ResetPassword.jsx
 * 
 * Settings Feature:
 * - pages/Settings.jsx, Profile.jsx
 * 
 * Notifications Feature:
 * - pages/Notifications.jsx
 * 
 * SHARED COMPONENTS (Keep in shared/components or components/ui):
 * -----------------------------------------------------------------------
 * 
 * UI Primitives (components/ui/*):
 * - DateDisplay.jsx, JalaliCalendar.jsx, LoadingButton.tsx, PageHeader.jsx
 * - SearchInput.jsx, Toast.jsx, LanguageSwitcher/*
 * 
 * Layout Components (components/layout/*):
 * - AppLayout/*, AppShell/*, HeaderToolbar/*, NavigationRail/*
 * 
 * ============================================================================
 * TARGET FOLDER STRUCTURE
 * ============================================================================
 * 
 * src/
 * ├── features/
 * │   ├── tasks/
 * │   │   ├── components/       # NEW: Task-specific components
 * │   │   │   ├── TaskRow/
 * │   │   │   ├── QuickAddBar/
 * │   │   │   ├── TaskList/
 * │   │   │   ├── TaskDetailPanel/
 * │   │   │   ├── TaskModal/
 * │   │   │   ├── TaskForm/
 * │   │   │   ├── TaskFilters/
 * │   │   │   ├── TaskCalendar/
 * │   │   │   └── index.js
 * │   │   ├── services/
 * │   │   ├── store/
 * │   │   ├── hooks/
 * │   │   ├── routes/
 * │   │   └── types/
 * │   │
 * │   ├── projects/
 * │   │   ├── components/       # NEW: Project-specific components
 * │   │   └── ...
 * │   │
 * │   ├── auth/
 * │   │   ├── components/       # NEW: Auth-specific components
 * │   │   └── pages/            # Login, Register, etc.
 * │   │
 * │   ├── settings/
 * │   │   ├── components/      # NEW: Settings-specific components
 * │   │   └── pages/
 * │   │
 * │   └── notifications/
 * │       ├── components/       # NEW: Notification-specific components
 * │       └── pages/
 * │
 * ├── shared/
 * │   └── components/           # NEW: Reusable, domain-agnostic components
 * │       ├── ui/              # UI primitives
 * │       └── layout/          # Layout components
 * │
 * ├── core/
 * └── app/
 * 
 * ============================================================================
 * IMPORT REFACTOR EXAMPLES
 * ============================================================================
 * 
 * BEFORE (Old Structure):
 * -----------------------
 * import TaskRow from '@/components/domain/Task/TaskRow';
 * import TaskModal from '@/components/tasks/TaskModal';
 * import Dashboard from '@/pages/Dashboard';
 * 
 * AFTER (New Structure):
 * -----------------------
 * import TaskRow from '@/features/tasks/components/TaskRow';
 * import TaskModal from '@/features/tasks/components/TaskModal';
 * import Dashboard from '@/features/tasks/pages/Dashboard';
 * 
 * SHARED COMPONENTS (Unchanged):
 * -------------------------------
 * import DateDisplay from '@/components/ui/DateDisplay';
 * import AppLayout from '@/components/layout/AppLayout';
 * 
 * ============================================================================
 * BEST PRACTICES APPLIED
 * ============================================================================
 * 
 * 1. Feature Isolation:
 *    - Each feature owns its components, services, stores, and types
 *    - Features can evolve independently
 *    - No cross-feature component imports
 * 
 * 2. Shared Components:
 *    - Only truly reusable, domain-agnostic components in shared/
 *    - UI primitives (buttons, inputs, etc.)
 *    - Layout components (header, sidebar, etc.)
 * 
 * 3. Clear Boundaries:
 *    - Feature imports: @/features/{feature}/
 *    - Shared imports: @/shared/components/ or @/components/ui/
 *    - Core imports: @/core/
 * 
 * 4. Barrel Exports:
 *    - Each feature has index.js exporting all public components
 *    - Enables clean imports from feature root
 * 
 * ============================================================================
 * MIGRATION CHECKLIST
 * ============================================================================
 * 
 * Phase 1: Create Feature Component Directories
 * [x] Create features/tasks/components/
 * [ ] Create features/projects/components/
 * [ ] Create features/auth/components/pages/
 * [ ] Create features/settings/components/pages/
 * [ ] Create features/notifications/components/pages/
 * 
 * Phase 2: Move Task Components
 * [ ] Move components/domain/Task/* → features/tasks/components/
 * [ ] Move components/tasks/* → features/tasks/components/
 * 
 * Phase 3: Move Page Components
 * [ ] Move pages/TaskList.jsx → features/tasks/pages/
 * [ ] Move pages/TaskDetails.jsx → features/tasks/pages/
 * [ ] Move pages/TaskForm.jsx → features/tasks/pages/
 * [ ] Move pages/Dashboard.jsx → features/tasks/pages/
 * [ ] Move pages/Calendar.jsx → features/tasks/pages/
 * [ ] Move auth pages → features/auth/pages/
 * [ ] Move settings pages → features/settings/pages/
 * 
 * Phase 4: Update Import Paths
 * [ ] Update all imports to use new feature paths
 * [ ] Update router to use new page locations
 * 
 * Phase 5: Cleanup
 * [ ] Remove old component locations
 * [ ] Verify no broken imports
 * [ ] Test application builds successfully
 */

export const COMPONENT_CLASSIFICATION = {
  featureSpecific: {
    tasks: [
      'TaskRow',
      'QuickAddBar', 
      'TaskList',
      'TaskDetailPanel',
      'TaskPreviewDialog',
      'TaskModal',
      'TaskForm',
      'TaskFilters',
      'TaskCalendar',
      'CalendarTaskItem',
      'CalendarFilters',
    ],
    auth: [
      'Login',
      'Register', 
      'ForgotPassword',
      'ResetPassword',
    ],
    settings: [
      'Settings',
      'Profile',
    ],
    notifications: [
      'Notifications',
    ],
  },
  shared: [
    'DateDisplay',
    'JalaliCalendar', 
    'LoadingButton',
    'PageHeader',
    'SearchInput',
    'Toast',
    'LanguageSwitcher',
    'AppLayout',
    'AppShell',
    'HeaderToolbar',
    'NavigationRail',
  ],
};

export const MIGRATION_STATUS = {
  phase1: { completed: false, items: [] },
  phase2: { completed: false, items: [] },
  phase3: { completed: false, items: [] },
  phase4: { completed: false, items: [] },
  phase5: { completed: false, items: [] },
};

export default COMPONENT_CLASSIFICATION;
