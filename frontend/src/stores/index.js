

// Domain stores
export { useAuthStore, useUser, useIsAuthenticated, useAuthLoading, useAuthError, useAuthActions } from './authStore';
export { useI18nStore, useLanguage, useTranslation, useDirection, useIsRTL, useI18nActions } from './i18nStore';
export { useThemeStore, useThemeMode, useIsDarkMode, useAccessibility, useColors, useThemeActions } from './themeStore';
export { useNavigationStore, useCurrentNavigation, useProjects, useTags, useSavedViews, useNavigationCounts, useNavigationLoading, useNavigationActions } from './navigationStore';
export { useUIStore, useToasts, useActiveModal, useModals, useGlobalLoading, useSidebar, useSearch, useUIPreferences, useToastActions, useModalActions, useUIActions } from './uiStore';
export { useTaskStore, useTasks, useTaskLoading, useTaskError, useTaskPagination, useTaskFilters, useSelectedTask, useSelectedTasks, useTaskById, useTaskActions } from './taskStore';
export { usePreferenceStore, usePreferences, usePreference, useLocale, useTimezone, useDateFormat, useTimeFormat, useCalendarPreferences, useTaskListPreferences, useNotificationPreferences, usePreferenceLoading, usePreferenceActions } from './preferenceStore';

// Store hooks
export { useStoreInitialization, StoreInitializer } from './hooks/useStoreInitialization';

// Store utilities
export { createSelectors, shallowSelector, combineSelector, stableSelector } from './utils/selectors';
export { defaultStorage, sessionStorage_, persistConfig, createMigration, clearPersistedStores, getPersistedState, setPersistedState } from './utils/persistence';
