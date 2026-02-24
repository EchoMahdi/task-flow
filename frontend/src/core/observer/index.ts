/**
 * Observer Pattern Infrastructure
 * 
 * Centralized event-observer system for decoupled, event-driven communication
 * across features and modules.
 * 
 * @package @core/observer
 * @version 1.0.0
 * 
 * @example
 * // Basic usage
 * import { emit, subscribe, EventNames } from '@core/observer';
 * 
 * // Subscribe to an event
 * const sub = subscribe(EventNames.TASK_CREATED, (event) => {
 *   console.log('Task created:', event.payload);
 * });
 * 
 * // Emit an event
 * emit(EventNames.TASK_CREATED, { taskId: '123', title: 'My Task' });
 * 
 * // Unsubscribe
 * unsubscribe(sub);
 * 
 * @example
 * // Using the Observer class
 * import { Observer, EventNames } from '@core/observer';
 * 
 * class TaskAnalyticsObserver extends Observer {
 *   constructor() {
 *     super('TaskAnalytics');
 *   }
 * 
 *   onMount() {
 *     this.subscribe(EventNames.TASK_CREATED, this.handleTaskCreated);
 *     this.subscribe(EventNames.TASK_DELETED, this.handleTaskDeleted);
 *   }
 * 
 *   handleTaskCreated = (event) => {
 *     // Track analytics
 *   };
 * 
 *   handleTaskDeleted = (event) => {
 *     // Track deletion
 *   };
 * }
 * 
 * const observer = new TaskAnalyticsObserver();
 * observer.mount();
 * // ... when done
 * observer.unmount();
 */

// Re-export types with proper type-only exports
export type {
  EventPayload,
  Event,
  EventHandler,
  SubscriptionOptions,
  Subscription,
  StoredSubscription,
  EventBusConfig,
  EventEmitter,
  TaskCreatedPayload,
  TaskMovedPayload,
  TaskUpdatedPayload,
  TaskDeletedPayload,
  TaskCompletedPayload,
  TaskAssignedToProjectPayload,
  ProjectCreatedPayload,
  ProjectUpdatedPayload,
  ProjectDeletedPayload,
  NotificationReceivedPayload,
  NotificationReadPayload,
  UserAuthenticatedPayload,
  UserLoggedOutPayload,
  ThemeChangedPayload,
  LanguageChangedPayload,
  EventPayloadFor,
} from './types';

// Re-export Event Registry
export {
  EventRegistry,
  Features,
  ValidActions,
  getFeatureFromEvent,
  getActionFromEvent,
  isValidEventName,
  isRegisteredEvent,
  getEventsByFeature,
  createEventPayload,
  DeprecatedEvents,
} from './eventRegistry';
export type { RegisteredEventName, FeatureName, StandardEventPayload } from './eventRegistry';

// Export event names constant
export { EventNames } from './types';

// Re-export EventBus class and functions
export { 
  EventBus,
  getGlobalEventBus,
  resetGlobalEventBus,
  createEventBus,
} from './eventBus';

// Re-export Observer classes and utilities
export {
  Observer,
  EventEmitterMixin,
  createOnceObserver,
  createDebouncedObserver,
  createThrottledObserver,
  createBatchedObserver,
  createScopedObserver,
  createFilteredObserver,
} from './observer';

// Convenience functions for quick usage
import { getGlobalEventBus } from './eventBus';
import type { EventHandler, EventPayload, Subscription, SubscriptionOptions } from './types';

// Import class exports
import { EventBus, createEventBus } from './eventBus';
import { Observer, createOnceObserver, createDebouncedObserver, createThrottledObserver, createBatchedObserver, createScopedObserver, createFilteredObserver } from './observer';

/**
 * Subscribe to an event with the global event bus
 */
export const subscribe = <T extends EventPayload = EventPayload>(
  eventName: string,
  handler: EventHandler<T>,
  options?: SubscriptionOptions
): Subscription => {
  return getGlobalEventBus().subscribe(eventName, handler, options);
};

/**
 * Subscribe to multiple events with the same handler
 */
export const subscribeToMany = <T extends EventPayload = EventPayload>(
  eventNames: string[],
  handler: EventHandler<T>,
  options?: SubscriptionOptions
): Subscription[] => {
  return getGlobalEventBus().subscribeToMany(eventNames, handler, options);
};

/**
 * Unsubscribe from an event
 */
export const unsubscribe = (subscription: Subscription): void => {
  getGlobalEventBus().unsubscribe(subscription);
};

/**
 * Unsubscribe all handlers
 */
export const unsubscribeAll = (eventName?: string, tag?: string): number => {
  return getGlobalEventBus().unsubscribeAll(eventName, tag);
};

/**
 * Emit an event synchronously
 */
export const emit = <T extends EventPayload = EventPayload>(
  eventName: string,
  payload: T
): void => {
  getGlobalEventBus().emit(eventName, payload);
};

/**
 * Emit an event asynchronously
 */
export const emitAsync = <T extends EventPayload = EventPayload>(
  eventName: string,
  payload: T
): Promise<void> => {
  return getGlobalEventBus().emitAsync(eventName, payload);
};

/**
 * Check if event has subscribers
 */
export const hasSubscribers = (eventName: string): boolean => {
  return getGlobalEventBus().hasSubscribers(eventName);
};

/**
 * Get subscriber count for an event
 */
export const getSubscriberCount = (eventName: string): number => {
  return getGlobalEventBus().getSubscriberCount(eventName);
};

/**
 * Get all registered event names
 */
export const getRegisteredEvents = (): string[] => {
  return getGlobalEventBus().getRegisteredEvents();
};

/**
 * Reset the global event bus (useful for testing)
 */
export const resetEventBus = (): void => {
  getGlobalEventBus().reset();
};

/**
 * Default export - convenience API
 */
export default {
  // Subscription
  subscribe,
  subscribeToMany,
  unsubscribe,
  unsubscribeAll,
  
  // Emission
  emit,
  emitAsync,
  
  // Queries
  hasSubscribers,
  getSubscriberCount,
  getRegisteredEvents,
  
  // Classes
  EventBus,
  Observer,
  
  // Factories
  getGlobalEventBus,
  createEventBus,
  
  // Utilities
  createOnceObserver,
  createDebouncedObserver,
  createThrottledObserver,
  createBatchedObserver,
  createScopedObserver,
  createFilteredObserver,
  
  // Reset
  resetEventBus,
};
