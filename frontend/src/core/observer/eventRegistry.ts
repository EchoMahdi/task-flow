/**
 * Event Registry - Centralized Event Naming Convention
 * 
 * This registry enforces a scalable, predictable, and feature-oriented naming convention
 * for all application events following the Observer Pattern.
 * 
 * =====================================================
 * NAMING PRINCIPLES
 * =====================================================
 * 
 * 1. Events must be feature-scoped
 * 2. Names must clearly describe WHAT happened, not WHAT should happen
 * 3. Events represent past actions (facts), not commands
 * 
 * ✅ Correct:
 *    tasks.created
 *    tasks.updated
 * 
 * ❌ Incorrect:
 *    createTask
 *    updateProjectNow
 * 
 * =====================================================
 * EVENT FORMAT
 * =====================================================
 * 
 * <feature>.<entity>.<action>
 * OR (short version when entity equals feature)
 * <feature>.<action>
 * 
 * Examples:
 *    tasks.created
 *    tasks.completed
 *    projects.updated
 *    teams.memberAdded
 *    notifications.sent
 * 
 * =====================================================
 * ACTION NAMING RULES
 * =====================================================
 * 
 * Use past tense verbs only:
 *    created, updated, deleted, completed, assigned, unassigned,
 *    moved, archived, restored, sent, received, read, archived
 * 
 * Never use:
 *    create, update, delete, doSomething, handleX
 * 
 * =====================================================
 * PAYLOAD SCHEMA
 * =====================================================
 * 
 * Each event payload must include:
 * {
 *   eventName: string
 *   feature: string
 *   entityId: string
 *   payload: object
 *   timestamp: number
 * }
 * 
 * =====================================================
 * VERSION SAFETY
 * =====================================================
 * 
 * Never rename existing events directly.
 * Instead:
 *    - deprecate old event
 *    - introduce new version
 * 
 * Example:
 *    tasks.updated    (deprecated)
 *    tasks.updated.v2 (new version)
 */

import { EventPayload } from './types';

/**
 * All registered event names in the application
 * Used for autocomplete, static analysis, and duplicate prevention
 */
export const EventRegistry = {
  // =========================================
  // TASKS FEATURE
  // =========================================
  TASKS: {
    CREATED: 'tasks.created',
    UPDATED: 'tasks.updated',
    DELETED: 'tasks.deleted',
    COMPLETED: 'tasks.completed',
    UNCOMPLETED: 'tasks.uncompleted',
    ARCHIVED: 'tasks.archived',
    RESTORED: 'tasks.restored',
    ASSIGNED: 'tasks.assigned',
    UNASSIGNED: 'tasks.unassigned',
    MOVED: 'tasks.moved',
    DUPLICATED: 'tasks.duplicated',
    PRIORITY_CHANGED: 'tasks.priorityChanged',
    DUE_DATE_CHANGED: 'tasks.dueDateChanged',
  } as const,

  // =========================================
  // PROJECTS FEATURE
  // =========================================
  PROJECTS: {
    CREATED: 'projects.created',
    UPDATED: 'projects.updated',
    DELETED: 'projects.deleted',
    ARCHIVED: 'projects.archived',
    RESTORED: 'projects.restored',
    MEMBER_ADDED: 'projects.memberAdded',
    MEMBER_REMOVED: 'projects.memberRemoved',
    ROLE_CHANGED: 'projects.roleChanged',
  } as const,

  // =========================================
  // TEAMS FEATURE
  // =========================================
  TEAMS: {
    CREATED: 'teams.created',
    UPDATED: 'teams.updated',
    DELETED: 'teams.deleted',
    ARCHIVED: 'teams.archived',
    RESTORED: 'teams.restored',
    MEMBER_ADDED: 'teams.memberAdded',
    MEMBER_REMOVED: 'teams.memberRemoved',
    MEMBER_UPDATED: 'teams.memberUpdated',
    ROLE_CHANGED: 'teams.roleChanged',
    INVITE_SENT: 'teams.inviteSent',
    INVITE_ACCEPTED: 'teams.inviteAccepted',
    INVITE_DECLINED: 'teams.inviteDeclined',
  } as const,

  // =========================================
  // NOTIFICATIONS FEATURE
  // =========================================
  NOTIFICATIONS: {
    SENT: 'notifications.sent',
    RECEIVED: 'notifications.received',
    READ: 'notifications.read',
    UNREAD: 'notifications.unread',
    DELETED: 'notifications.deleted',
    MARKED_ALL_READ: 'notifications.markedAllRead',
  } as const,

  // =========================================
  // SETTINGS FEATURE
  // =========================================
  SETTINGS: {
    UPDATED: 'settings.updated',
    PREFERENCE_CHANGED: 'settings.preferenceChanged',
    THEME_CHANGED: 'settings.themeChanged',
    LANGUAGE_CHANGED: 'settings.languageChanged',
  } as const,

  // =========================================
  // AUTH FEATURE
  // =========================================
  AUTH: {
    LOGGED_IN: 'auth.loggedIn',
    LOGGED_OUT: 'auth.loggedOut',
    REGISTERED: 'auth.registered',
    PASSWORD_CHANGED: 'auth.passwordChanged',
    EMAIL_VERIFIED: 'auth.emailVerified',
    SESSION_EXPIRED: 'auth.sessionExpired',
  } as const,
} as const;

/**
 * Union type of all registered event names
 */
export type RegisteredEventName = 
  | typeof EventRegistry.TASKS[keyof typeof EventRegistry.TASKS]
  | typeof EventRegistry.PROJECTS[keyof typeof EventRegistry.PROJECTS]
  | typeof EventRegistry.TEAMS[keyof typeof EventRegistry.TEAMS]
  | typeof EventRegistry.NOTIFICATIONS[keyof typeof EventRegistry.NOTIFICATIONS]
  | typeof EventRegistry.SETTINGS[keyof typeof EventRegistry.SETTINGS]
  | typeof EventRegistry.AUTH[keyof typeof EventRegistry.AUTH];

/**
 * Feature names for categorization
 */
export const Features = {
  TASKS: 'tasks',
  PROJECTS: 'projects',
  TEAMS: 'teams',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  AUTH: 'auth',
} as const;

export type FeatureName = typeof Features[keyof typeof Features];

/**
 * Extract feature name from event name
 */
export const getFeatureFromEvent = (eventName: string): FeatureName | null => {
  const feature = eventName.split('.')[0];
  return feature in Features ? feature as FeatureName : null;
};

/**
 * Extract action from event name
 */
export const getActionFromEvent = (eventName: string): string | null => {
  const parts = eventName.split('.');
  return parts.length >= 2 ? parts[parts.length - 1] : null;
};

/**
 * Validate event name format
 */
export const isValidEventName = (eventName: string): boolean => {
  // Must have at least feature.action format
  const parts = eventName.split('.');
  if (parts.length < 2) return false;
  
  // Feature must be lowercase
  if (parts[0] !== parts[0].toLowerCase()) return false;
  
  // Action must be past tense
  const action = parts[parts.length - 1];
  const pastTensePatterns = [
    /ed$/,                    // created, updated, deleted
    /n$/,                     // completed, moved
    /g$/,                     // following
  ];
  
  // Common past tense endings
  const validPastTense = ['created', 'updated', 'deleted', 'completed', 'uncompleted', 
    'archived', 'restored', 'assigned', 'unassigned', 'moved', 'duplicated', 
    'sent', 'received', 'read', 'unread', 'changed', 'added', 'removed', 
    'loggedIn', 'loggedOut', 'verified', 'expired', 'accepted', 'declined'];
  
  return validPastTense.includes(action);
};

/**
 * Common past tense actions for reference
 */
export const ValidActions = {
  // CRUD operations
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  
  // Status changes
  COMPLETED: 'completed',
  UNCOMPLETED: 'uncompleted',
  ARCHIVED: 'archived',
  RESTORED: 'restored',
  
  // Assignment
  ASSIGNED: 'assigned',
  UNASSIGNED: 'unassigned',
  
  // Movement
  MOVED: 'moved',
  DUPLICATED: 'duplicated',
  
  // Notifications
  SENT: 'sent',
  RECEIVED: 'received',
  READ: 'read',
  UNREAD: 'unread',
  
  // Changes
  CHANGED: 'changed',
  UPDATED_PREFERENCE: 'preferenceChanged',
  UPDATED_THEME: 'themeChanged',
  UPDATED_LANGUAGE: 'languageChanged',
  UPDATED_PRIORITY: 'priorityChanged',
  UPDATED_DUE_DATE: 'dueDateChanged',
  
  // Team/Project membership
  MEMBER_ADDED: 'memberAdded',
  MEMBER_REMOVED: 'memberRemoved',
  MEMBER_UPDATED: 'memberUpdated',
  ROLE_CHANGED: 'roleChanged',
  
  // Invitations
  INVITE_SENT: 'inviteSent',
  INVITE_ACCEPTED: 'inviteAccepted',
  INVITE_DECLINED: 'inviteDeclined',
  
  // Authentication
  LOGGED_IN: 'loggedIn',
  LOGGED_OUT: 'loggedOut',
  REGISTERED: 'registered',
  PASSWORD_CHANGED: 'passwordChanged',
  EMAIL_VERIFIED: 'emailVerified',
  SESSION_EXPIRED: 'sessionExpired',
  
  // Bulk operations
  MARKED_ALL_READ: 'markedAllRead',
} as const;

/**
 * Standard event payload builder
 */
export interface StandardEventPayload extends EventPayload {
  eventName: string;
  feature: string;
  entityId: string;
  payload: Record<string, unknown>;
}

/**
 * Create a standardized event payload
 */
export const createEventPayload = (
  eventName: string,
  entityId: string,
  payload: Record<string, unknown> = {}
): StandardEventPayload => {
  const feature = getFeatureFromEvent(eventName);
  
  if (!feature) {
    throw new Error(`Invalid event name format: ${eventName}`);
  }
  
  return {
    eventName,
    feature,
    entityId,
    payload,
    timestamp: Date.now(),
  };
};

/**
 * Get all events for a specific feature
 */
export const getEventsByFeature = (feature: FeatureName): string[] => {
  const featureEvents: Record<FeatureName, readonly string[]> = {
    [Features.TASKS]: Object.values(EventRegistry.TASKS),
    [Features.PROJECTS]: Object.values(EventRegistry.PROJECTS),
    [Features.TEAMS]: Object.values(EventRegistry.TEAMS),
    [Features.NOTIFICATIONS]: Object.values(EventRegistry.NOTIFICATIONS),
    [Features.SETTINGS]: Object.values(EventRegistry.SETTINGS),
    [Features.AUTH]: Object.values(EventRegistry.AUTH),
  };
  
  return [...(featureEvents[feature] || [])];
};

/**
 * Check if an event is registered
 */
export const isRegisteredEvent = (eventName: string): boolean => {
  const allEvents = [
    ...Object.values(EventRegistry.TASKS),
    ...Object.values(EventRegistry.PROJECTS),
    ...Object.values(EventRegistry.TEAMS),
    ...Object.values(EventRegistry.NOTIFICATIONS),
    ...Object.values(EventRegistry.SETTINGS),
    ...Object.values(EventRegistry.AUTH),
  ];
  
  return allEvents.includes(eventName as RegisteredEventName);
};

/**
 * Deprecated events map
 * Use this to track renamed events for backwards compatibility
 */
export const DeprecatedEvents: Record<string, string> = {
  // Add deprecated events here when renaming
  // Example: 'task.created': 'tasks.created',
};

export default EventRegistry;
