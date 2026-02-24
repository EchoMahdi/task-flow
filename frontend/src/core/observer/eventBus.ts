/**
 * Event Bus Implementation
 * 
 * Centralized event dispatcher that handles event publishing and subscription
 * following the Observer Pattern. Provides async support, error handling,
 * and memory-safe subscription management.
 */

import {
  Event,
  EventBusConfig,
  EventEmitter,
  EventHandler,
  EventPayload,
  StoredSubscription,
  Subscription,
  SubscriptionOptions,
} from './types';

/**
 * Generates a unique identifier for subscriptions
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Event Bus - Central hub for event-driven communication
 * 
 * Features:
 * - Multiple subscribers per event
 * - Async event handling support
 * - Subscription lifecycle management
 * - Error isolation per handler
 * - Replay buffer for late subscribers
 * - Debug logging capability
 * 
 * @example
 * ```typescript
 * const eventBus = new EventBus();
 * 
 * // Subscribe to events
 * const sub = eventBus.subscribe('task.created', (event) => {
 *   console.log('Task created:', event.payload);
 * });
 * 
 * // Emit events
 * eventBus.emit('task.created', { taskId: '123', title: 'New Task' });
 * 
 * // Cleanup
 * eventBus.unsubscribe(sub);
 * ```
 */
export class EventBus implements EventEmitter {
  private subscriptions: Map<string, StoredSubscription[]> = new Map();
  private replayBuffer: Map<string, Event<EventPayload>[]> = new Map();
  private config: Required<EventBusConfig>;
  private debug: boolean;

  constructor(config: EventBusConfig = {}) {
    this.config = {
      replayBufferSize: config.replayBufferSize ?? 10,
      handleErrors: config.handleErrors ?? true,
      debug: config.debug ?? (process.env.NODE_ENV !== 'production'),
    };
    this.debug = this.config.debug;
  }

  /**
   * Subscribe to an event
   * @returns Subscription object for cleanup
   */
  subscribe<T extends EventPayload = EventPayload>(
    eventName: string,
    handler: EventHandler<T>,
    options: SubscriptionOptions = {}
  ): Subscription {
    const subscription: StoredSubscription = {
      id: generateId(),
      eventName,
      handler: handler as EventHandler<EventPayload>,
      options: {
        replay: options.replay ?? false,
        priority: options.priority ?? 0,
        tag: options.tag,
      },
      active: true,
      createdAt: Date.now(),
    };

    // Get existing subscriptions or create new array
    const eventSubscriptions = this.subscriptions.get(eventName) || [];
    
    // Add new subscription with priority sorting
    eventSubscriptions.push(subscription);
    eventSubscriptions.sort((a, b) => b.options.priority - a.options.priority);
    
    this.subscriptions.set(eventName, eventSubscriptions);
    
    // Send replay events if requested
    if (subscription.options.replay) {
      const bufferedEvents = this.replayBuffer.get(eventName) || [];
      bufferedEvents.forEach((event) => {
        this.invokeHandler(subscription, event);
      });
    }

    this.log(`[EventBus] Subscribed to "${eventName}" with id ${subscription.id}`);

    return subscription;
  }

  /**
   * Subscribe to multiple events with the same handler
   */
  subscribeToMany<T extends EventPayload = EventPayload>(
    eventNames: string[],
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): Subscription[] {
    return eventNames.map((eventName) =>
      this.subscribe(eventName, handler, options)
    );
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(subscription: Subscription): void {
    const eventSubscriptions = this.subscriptions.get(subscription.eventName);
    
    if (!eventSubscriptions) {
      return;
    }

    const index = eventSubscriptions.findIndex((sub) => sub.id === subscription.id);
    
    if (index !== -1) {
      eventSubscriptions.splice(index, 1);
      
      // Clean up empty arrays
      if (eventSubscriptions.length === 0) {
        this.subscriptions.delete(subscription.eventName);
      } else {
        this.subscriptions.set(subscription.eventName, eventSubscriptions);
      }
      
      this.log(`[EventBus] Unsubscribed from "${subscription.eventName}" (id: ${subscription.id})`);
    }
  }

  /**
   * Unsubscribe all handlers matching criteria
   * @returns Number of subscriptions removed
   */
  unsubscribeAll(eventName?: string, tag?: string): number {
    let removedCount = 0;

    if (eventName) {
      // Unsubscribe from specific event
      const eventSubscriptions = this.subscriptions.get(eventName);
      
      if (eventSubscriptions) {
        if (tag) {
          const toRemove = eventSubscriptions.filter((sub) => sub.options.tag === tag);
          removedCount = toRemove.length;
          const remaining = eventSubscriptions.filter((sub) => sub.options.tag !== tag);
          
          if (remaining.length === 0) {
            this.subscriptions.delete(eventName);
          } else {
            this.subscriptions.set(eventName, remaining);
          }
        } else {
          removedCount = eventSubscriptions.length;
          this.subscriptions.delete(eventName);
        }
      }
    } else if (tag) {
      // Unsubscribe all with matching tag across all events
      this.subscriptions.forEach((eventSubscriptions, name) => {
        const toRemove = eventSubscriptions.filter((sub) => sub.options.tag === tag);
        removedCount += toRemove.length;
        
        const remaining = eventSubscriptions.filter((sub) => sub.options.tag !== tag);
        
        if (remaining.length === 0) {
          this.subscriptions.delete(name);
        } else {
          this.subscriptions.set(name, remaining);
        }
      });
    } else {
      // Clear all subscriptions
      removedCount = this.subscriptions.size;
      this.subscriptions.clear();
    }

    this.log(`[EventBus] Unsubscribed ${removedCount} handler(s)`);
    return removedCount;
  }

  /**
   * Emit an event synchronously to all subscribers
   */
  emit<T extends EventPayload = EventPayload>(eventName: string, payload: T): void {
    const event: Event<T> = {
      name: eventName,
      payload: {
        ...payload,
        timestamp: payload.timestamp ?? Date.now(),
      },
    };

    this.log(`[EventBus] Emitting "${eventName}"`);

    // Store in replay buffer
    this.addToReplayBuffer(eventName, event);

    // Get subscribers
    const eventSubscriptions = this.subscriptions.get(eventName);
    
    if (!eventSubscriptions || eventSubscriptions.length === 0) {
      this.log(`[EventBus] No subscribers for "${eventName}"`);
      return;
    }

    // Invoke all handlers
    eventSubscriptions.forEach((subscription) => {
      if (subscription.active) {
        this.invokeHandler(subscription, event);
      }
    });
  }

  /**
   * Emit an event asynchronously to all subscribers
   */
  async emitAsync<T extends EventPayload = EventPayload>(
    eventName: string,
    payload: T
  ): Promise<void> {
    const event: Event<T> = {
      name: eventName,
      payload: {
        ...payload,
        timestamp: payload.timestamp ?? Date.now(),
      },
    };

    this.log(`[EventBus] Emitting async "${eventName}"`);

    // Store in replay buffer
    this.addToReplayBuffer(eventName, event);

    // Get subscribers
    const eventSubscriptions = this.subscriptions.get(eventName);
    
    if (!eventSubscriptions || eventSubscriptions.length === 0) {
      this.log(`[EventBus] No subscribers for "${eventName}"`);
      return;
    }

    // Invoke all handlers concurrently
    const promises = eventSubscriptions
      .filter((subscription) => subscription.active)
      .map((subscription) => this.invokeHandlerAsync(subscription, event));

    await Promise.all(promises);
  }

  /**
   * Check if there are subscribers for a specific event
   */
  hasSubscribers(eventName: string): boolean {
    const subscriptions = this.subscriptions.get(eventName);
    return !!(subscriptions && subscriptions.length > 0);
  }

  /**
   * Get count of subscribers for an event
   */
  getSubscriberCount(eventName: string): number {
    const subscriptions = this.subscriptions.get(eventName);
    return subscriptions ? subscriptions.length : 0;
  }

  /**
   * Get all registered event names
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Clear all subscriptions and replay buffers
   */
  reset(): void {
    this.subscriptions.clear();
    this.replayBuffer.clear();
    this.log('[EventBus] EventBus reset - all subscriptions cleared');
  }

  /**
   * Set debug mode
   */
  setDebug(enabled: boolean): void {
    this.debug = enabled;
    this.config.debug = enabled;
  }

  // Private methods

  /**
   * Invoke a handler with optional error handling
   */
  private invokeHandler(subscription: StoredSubscription, event: Event<EventPayload>): void {
    if (this.config.handleErrors) {
      try {
        subscription.handler(event);
      } catch (error) {
        console.error(
          `[EventBus] Error in handler for "${event.name}" (id: ${subscription.id}):`,
          error
        );
      }
    } else {
      subscription.handler(event);
    }
  }

  /**
   * Invoke a handler asynchronously with error handling
   */
  private async invokeHandlerAsync(
    subscription: StoredSubscription,
    event: Event<EventPayload>
  ): Promise<void> {
    if (this.config.handleErrors) {
      try {
        await subscription.handler(event);
      } catch (error) {
        console.error(
          `[EventBus] Async error in handler for "${event.name}" (id: ${subscription.id}):`,
          error
        );
      }
    } else {
      await subscription.handler(event);
    }
  }

  /**
   * Add event to replay buffer
   */
  private addToReplayBuffer<T extends EventPayload>(eventName: string, event: Event<T>): void {
    const buffer = this.replayBuffer.get(eventName) || [];
    buffer.push(event as Event<EventPayload>);

    // Trim buffer to max size
    if (buffer.length > this.config.replayBufferSize) {
      buffer.shift();
    }

    this.replayBuffer.set(eventName, buffer);
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(message);
    }
  }
}

/**
 * Singleton instance for global access
 * Use this for application-wide event bus
 */
let globalEventBus: EventBus | null = null;

/**
 * Get or create the global EventBus instance
 */
export const getGlobalEventBus = (config?: EventBusConfig): EventBus => {
  if (!globalEventBus) {
    globalEventBus = new EventBus(config);
  }
  return globalEventBus;
};

/**
 * Reset the global EventBus instance
 * Useful for testing
 */
export const resetGlobalEventBus = (): void => {
  if (globalEventBus) {
    globalEventBus.reset();
  }
  globalEventBus = null;
};

/**
 * Create a new EventBus instance (for isolated testing or scoped usage)
 */
export const createEventBus = (config?: EventBusConfig): EventBus => {
  return new EventBus(config);
};

export default EventBus;
