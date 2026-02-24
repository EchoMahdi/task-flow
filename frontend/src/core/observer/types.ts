/**
 * Core Observer Pattern Types
 * 
 * Defines the fundamental types for the event-driven architecture.
 * These types enable type-safe event publishing and subscribing across features.
 * 
 * =====================================================
 * NAMING CONVENTION
 * =====================================================
 * Events must follow: <feature>.<past_participle>
 * Examples:
 *   - tasks.created
 *   - tasks.updated
 *   - projects.memberAdded
 *   - teams.roleChanged
 * 
 * All actions MUST use past tense.
 * Compound actions use camelCase (e.g., priorityChanged, dueDateChanged).
 * =====================================================
 * PAYLOAD STANDARD
 * =====================================================
 * All payloads should include:
 *   - timestamp: when the event occurred
 *   - source: what emitted the event
 *   - feature-specific fields
 */

/**
 * Base interface for all event payloads
 * Features should extend this interface for their specific events
 */
export interface EventPayload {
  /** Timestamp when the event was created */
  timestamp?: number;
  /** Optional source identifier of the event emitter */
  source?: string;
}

/**
 * Standard payload for CRUD events
 * Use this as a base for simple entity events
 */
export interface StandardCRUDPayload extends EventPayload {
  /** Unique identifier of the entity */
  entityId: string;
  /** Optional ID of parent/related entity */
  relatedEntityId?: string;
}

/**
 * Generic event interface with strongly-typed payload
 * @template T - The type of the event payload
 */
export interface Event<T extends EventPayload = EventPayload> {
  /** Unique event name that identifies this event type */
  name: string;
  /** The payload data associated with the event */
  payload: T;
}

/**
 * Event handler function signature
 * @template T - The type of event payload the handler expects
 * @param event - The event object containing name and payload
 * @returns void or Promise<void> for async handlers
 */
export type EventHandler<T extends EventPayload = EventPayload> = (
  event: Event<T>
) => void | Promise<void>;

/**
 * Subscription options for fine-tuning event listener behavior
 */
export interface SubscriptionOptions {
  /** 
   * If true, the handler will be called for events emitted before subscription
   * Useful for getting current state on mount
   * @default false
   */
  replay?: boolean;
  /**
   * Priority level for handler execution order (higher = earlier)
   * @default 0
   */
  priority?: number;
  /**
   * Optional tag for grouping/identifying subscriptions
   * Useful for bulk unsubscribe operations
   */
  tag?: string;
}

/**
 * Represents an active event subscription
 * Returned from subscribe() for later cleanup
 */
export interface Subscription {
  /** Unique identifier for this subscription */
  readonly id: string;
  /** The event name this subscription is listening to */
  readonly eventName: string;
  /** The handler function */
  readonly handler: EventHandler;
  /** Options used when creating this subscription */
  readonly options: SubscriptionOptions;
  /** Whether this subscription is still active */
  readonly active: boolean;
}

/**
 * Internal subscription storage format
 */
export interface StoredSubscription extends Subscription {
  /** Timestamp when subscription was created */
  createdAt: number;
}

/**
 * Event Bus configuration options
 */
export interface EventBusConfig {
  /**
   * Maximum number of events to keep in replay buffer per event type
   * @default 10
   */
  replayBufferSize?: number;
  /**
   * Whether to enable error handling wrapper around handlers
   * @default true
   */
  handleErrors?: boolean;
  /**
   * Whether to log events in development
   * @default false
   */
  debug?: boolean;
}

/**
 * Event emitter capabilities
 */
export interface EventEmitter {
  /**
   * Subscribe to an event
   * @param eventName - Name of the event to listen for
   * @param handler - Function to call when event is emitted
   * @param options - Optional subscription configuration
   * @returns Subscription object for cleanup
   */
  subscribe<T extends EventPayload>(
    eventName: string,
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): Subscription;
  
  /**
   * Subscribe to multiple events with the same handler
   * @param eventNames - Array of event names to listen for
   * @param handler - Function to call when any of the events are emitted
   * @param options - Optional subscription configuration
   * @returns Array of Subscription objects
   */
  subscribeToMany<T extends EventPayload>(
    eventNames: string[],
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): Subscription[];
  
  /**
   * Unsubscribe from an event
   * @param subscription - The subscription to remove
   */
  unsubscribe(subscription: Subscription): void;
  
  /**
   * Unsubscribe all handlers matching the given criteria
   * @param eventName - Optional event name to filter by
   * @param tag - Optional tag to filter by
   */
  unsubscribeAll(eventName?: string, tag?: string): number;
  
  /**
   * Emit an event to all subscribers
   * @param eventName - Name of the event
   * @param payload - Event payload data
   */
  emit<T extends EventPayload>(eventName: string, payload: T): void;
  
  /**
   * Emit an event asynchronously to all subscribers
   * @param eventName - Name of the event
   * @param payload - Event payload data
   */
  emitAsync<T extends EventPayload>(eventName: string, payload: T): Promise<void>;
}

/**
 * Predefined application events
 * Features should define their own events following this pattern
 */

// Task Events
export interface TaskCreatedPayload extends EventPayload {
  taskId: string;
  projectId: string;
  title: string;
  /** Tag IDs associated with the task */
  tagIds?: number[];
}

export interface TaskMovedPayload extends EventPayload {
  taskId: string;
  fromProjectId: string;
  toProjectId: string;
  fromStatus?: string;
  toStatus?: string;
}

export interface TaskUpdatedPayload extends EventPayload {
  taskId: string;
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
  /** Tag IDs associated with the task */
  tagIds?: number[];
}

export interface TaskDeletedPayload extends EventPayload {
  taskId: string;
  projectId: string;
  /** Tag IDs of the deleted task for count updates */
  tagIds?: number[];
}

export interface TaskCompletedPayload extends EventPayload {
  taskId: string;
  projectId: string;
  wasCompleted: boolean;
  /** Tag IDs associated with the task */
  tagIds?: number[];
}

export interface TaskAssignedToProjectPayload extends EventPayload {
  taskId: string;
  projectId: string | null;
  previousProjectId: string | null;
  /** Tag IDs associated with the task */
  tagIds?: number[];
}

// Project Events
export interface ProjectCreatedPayload extends EventPayload {
  projectId: string;
  name: string;
}

export interface ProjectUpdatedPayload extends EventPayload {
  projectId: string;
  changes: Record<string, unknown>;
}

export interface ProjectDeletedPayload extends EventPayload {
  projectId: string;
}

// Notification Events
export interface NotificationReceivedPayload extends EventPayload {
  notificationId: string;
  type: string;
  title: string;
  body?: string;
}

export interface NotificationReadPayload extends EventPayload {
  notificationId: string;
}

// User Events
export interface UserAuthenticatedPayload extends EventPayload {
  userId: string;
  email: string;
}

export interface UserLoggedOutPayload extends EventPayload {
  userId: string;
}

// UI Events
export interface ThemeChangedPayload extends EventPayload {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
}

export interface LanguageChangedPayload extends EventPayload {
  language: string;
  previousLanguage: string;
}

// Export event name constants for type safety
export const EventNames = {
  // Task Events (using plural feature name + past tense)
  TASK_CREATED: 'tasks.created',
  TASK_MOVED: 'tasks.moved',
  TASK_UPDATED: 'tasks.updated',
  TASK_DELETED: 'tasks.deleted',
  TASK_COMPLETED: 'tasks.completed',
  TASK_UNCOMPLETED: 'tasks.uncompleted',
  TASK_ASSIGNED: 'tasks.assigned',
  TASK_UNASSIGNED: 'tasks.unassigned',
  
  // Project Events
  PROJECT_CREATED: 'projects.created',
  PROJECT_UPDATED: 'projects.updated',
  PROJECT_DELETED: 'projects.deleted',
  PROJECT_ARCHIVED: 'projects.archived',
  PROJECT_MEMBER_ADDED: 'projects.memberAdded',
  PROJECT_MEMBER_REMOVED: 'projects.memberRemoved',
  
  // Team Events
  TEAM_CREATED: 'teams.created',
  TEAM_UPDATED: 'teams.updated',
  TEAM_DELETED: 'teams.deleted',
  TEAM_MEMBER_ADDED: 'teams.memberAdded',
  TEAM_MEMBER_REMOVED: 'teams.memberRemoved',
  TEAM_ROLE_CHANGED: 'teams.roleChanged',
  
  // Notification Events
  NOTIFICATION_SENT: 'notifications.sent',
  NOTIFICATION_RECEIVED: 'notifications.received',
  NOTIFICATION_READ: 'notifications.read',
  NOTIFICATION_UNREAD: 'notifications.unread',
  NOTIFICATION_DELETED: 'notifications.deleted',
  NOTIFICATION_MARKED_ALL_READ: 'notifications.markedAllRead',
  
  // User/Auth Events
  USER_LOGGED_IN: 'auth.loggedIn',
  USER_LOGGED_OUT: 'auth.loggedOut',
  USER_REGISTERED: 'auth.registered',
  USER_PASSWORD_CHANGED: 'auth.passwordChanged',
  USER_EMAIL_VERIFIED: 'auth.emailVerified',
  USER_SESSION_EXPIRED: 'auth.sessionExpired',
  
  // Settings Events
  SETTINGS_UPDATED: 'settings.updated',
  SETTINGS_PREFERENCE_CHANGED: 'settings.preferenceChanged',
  SETTINGS_THEME_CHANGED: 'settings.themeChanged',
  SETTINGS_LANGUAGE_CHANGED: 'settings.languageChanged',
} as const;

/**
 * Type helper to extract payload type from event name
 * Useful for strongly-typed event handlers
 */
export type EventPayloadFor<EventName extends string> = 
  // Task Events
  EventName extends typeof EventNames.TASK_CREATED ? TaskCreatedPayload :
  EventName extends typeof EventNames.TASK_MOVED ? TaskMovedPayload :
  EventName extends typeof EventNames.TASK_UPDATED ? TaskUpdatedPayload :
  EventName extends typeof EventNames.TASK_DELETED ? TaskDeletedPayload :
  EventName extends typeof EventNames.TASK_COMPLETED ? TaskCompletedPayload :
  EventName extends typeof EventNames.TASK_ASSIGNED ? TaskCompletedPayload :
  // Project Events
  EventName extends typeof EventNames.PROJECT_CREATED ? ProjectCreatedPayload :
  EventName extends typeof EventNames.PROJECT_UPDATED ? ProjectUpdatedPayload :
  EventName extends typeof EventNames.PROJECT_DELETED ? ProjectDeletedPayload :
  // Notification Events
  EventName extends typeof EventNames.NOTIFICATION_SENT ? NotificationReceivedPayload :
  EventName extends typeof EventNames.NOTIFICATION_RECEIVED ? NotificationReceivedPayload :
  EventName extends typeof EventNames.NOTIFICATION_READ ? NotificationReadPayload :
  // User/Auth Events
  EventName extends typeof EventNames.USER_LOGGED_IN ? UserAuthenticatedPayload :
  EventName extends typeof EventNames.USER_LOGGED_OUT ? UserLoggedOutPayload :
  // Settings Events
  EventName extends typeof EventNames.SETTINGS_THEME_CHANGED ? ThemeChangedPayload :
  EventName extends typeof EventNames.SETTINGS_LANGUAGE_CHANGED ? LanguageChangedPayload :
  EventPayload;
