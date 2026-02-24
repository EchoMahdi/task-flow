/**
 * Observer Pattern Abstractions
 * 
 * Provides higher-level abstractions for creating and managing observers.
 * Includes mixins, class-based observers, and convenience functions.
 */

import {
  Event,
  EventHandler,
  EventPayload,
  Subscription,
  SubscriptionOptions,
} from './types';

import {
  EventBus,
  getGlobalEventBus,
} from './eventBus';

/**
 * Mixin for classes that need to emit events
 * Provides built-in event emission capabilities
 * 
 * @example
 * ```typescript
 * class TaskService extends EventEmitterMixin(EventBus) {
 *   createTask(data: TaskData) {
 *     const task = this.saveTask(data);
 *     this.emit('task.created', { taskId: task.id, ...data });
 *     return task;
 *   }
 * }
 * ```
 */
export const EventEmitterMixin = <T extends new (...args: any[]) => any>(
  Base: T
): T => {
  return class extends Base {
    private _eventBus: EventBus | null = null;

    /**
     * Get or set the event bus instance
     */
    get eventBusInstance(): EventBus {
      if (!this._eventBus) {
        this._eventBus = getGlobalEventBus();
      }
      return this._eventBus;
    }

    set eventBusInstance(bus: EventBus) {
      this._eventBus = bus;
    }

    /**
     * Emit an event
     */
    emit<T extends EventPayload = EventPayload>(
      eventName: string,
      payload: T
    ): void {
      this.eventBusInstance.emit(eventName, payload);
    }

    /**
     * Emit an event asynchronously
     */
    emitAsync<T extends EventPayload = EventPayload>(
      eventName: string,
      payload: T
    ): Promise<void> {
      return this.eventBusInstance.emitAsync(eventName, payload);
    }

    /**
     * Subscribe to an event
     */
    subscribe<T extends EventPayload = EventPayload>(
      eventName: string,
      handler: EventHandler<T>,
      options?: SubscriptionOptions
    ): Subscription {
      return this.eventBusInstance.subscribe(eventName, handler, options);
    }

    /**
     * Subscribe to multiple events
     */
    subscribeToMany<T extends EventPayload = EventPayload>(
      eventNames: string[],
      handler: EventHandler<T>,
      options?: SubscriptionOptions
    ): Subscription[] {
      return this.eventBusInstance.subscribeToMany(eventNames, handler, options);
    }

    /**
     * Unsubscribe a subscription
     */
    unsubscribe(subscription: Subscription): void {
      this.eventBusInstance.unsubscribe(subscription);
    }

    /**
     * Unsubscribe all handlers
     */
    unsubscribeAll(eventName?: string, tag?: string): number {
      return this.eventBusInstance.unsubscribeAll(eventName, tag);
    }
  };
};

/**
 * Concrete Observer class for creating reusable observer components
 * Extend this class to create feature-specific observers
 * 
 * @example
 * ```typescript
 * class TaskObserver extends Observer {
 *   constructor() {
 *     super('TaskObserver');
 *   }
 * 
 *   handleTaskCreated(event: Event<TaskCreatedPayload>) {
 *     // Handle task creation
 *     this.trackAnalytics(event.payload);
 *   }
 * 
 *   mount() {
 *     this.subscribe('task.created', this.handleTaskCreated.bind(this));
 *   }
 * }
 * ```
 */
export class Observer {
  protected subscriptions: Subscription[] = [];
  protected eventBus: EventBus;
  protected name: string;
  protected mounted: boolean = false;
  protected onMountCallback?: () => void;
  protected onUnmountCallback?: () => void;

  constructor(name: string, eventBus?: EventBus) {
    this.name = name;
    this.eventBus = eventBus || getGlobalEventBus();
  }

  /**
   * Subscribe to an event - convenience method
   */
  subscribe<T extends EventPayload = EventPayload>(
    eventName: string,
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): Subscription {
    const subscription = this.eventBus.subscribe(eventName, handler, {
      ...options,
      tag: options?.tag ?? this.name,
    });
    
    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Subscribe to multiple events
   */
  subscribeToMany<T extends EventPayload = EventPayload>(
    eventNames: string[],
    handler: EventHandler<T>,
    options?: SubscriptionOptions
  ): Subscription[] {
    const newSubscriptions = this.eventBus.subscribeToMany(
      eventNames,
      handler,
      {
        ...options,
        tag: options?.tag ?? this.name,
      }
    );
    
    this.subscriptions.push(...newSubscriptions);
    return newSubscriptions;
  }

  /**
   * Unsubscribe a specific subscription
   */
  unsubscribe(subscription: Subscription): void {
    this.eventBus.unsubscribe(subscription);
    const index = this.subscriptions.indexOf(subscription);
    if (index > -1) {
      this.subscriptions.splice(index, 1);
    }
  }

  /**
   * Unsubscribe all subscriptions owned by this observer
   */
  unsubscribeAll(): number {
    const count = this.eventBus.unsubscribeAll(undefined, this.name);
    this.subscriptions = [];
    return count;
  }

  /**
   * Mount the observer - start listening to events
   */
  mount(): void {
    if (this.mounted) {
      console.warn(`[${this.name}] Observer already mounted`);
      return;
    }
    this.mounted = true;
    
    if (this.onMountCallback) {
      this.onMountCallback();
    }
    this.onMount();
  }

  /**
   * Unmount the observer - clean up subscriptions
   */
  unmount(): void {
    if (!this.mounted) {
      return;
    }
    
    if (this.onUnmountCallback) {
      this.onUnmountCallback();
    }
    this.onUnmount();
    this.unsubscribeAll();
    this.mounted = false;
  }

  /**
   * Hook called when observer is mounted
   * Override in subclasses to set up subscriptions
   */
  onMount(): void {
    // Override in subclasses
  }

  /**
   * Hook called when observer is unmounted
   * Override in subclasses to clean up resources
   */
  onUnmount(): void {
    // Override in subclasses
  }

  /**
   * Check if observer is mounted
   */
  isMounted(): boolean {
    return this.mounted;
  }

  /**
   * Get subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.length;
  }

  /**
   * Set mount callback (alternative to extending)
   */
  onMounted(callback: () => void): this {
    this.onMountCallback = callback;
    return this;
  }

  /**
   * Set unmount callback (alternative to extending)
   */
  onUnmounted(callback: () => void): this {
    this.onUnmountCallback = callback;
    return this;
  }
}

/**
 * Creates a one-time observer that auto-unsubscribes after first event
 * Useful for "fire and forget" event handling
 * 
 * @example
 * ```typescript
 * const observer = createOnceObserver('task.created', (event) => {
 *   console.log('Task created:', event.payload);
 * });
 * observer.mount();
 * // After first 'task.created' event, automatically unmounts
 * ```
 */
export const createOnceObserver = (
  eventName: string,
  handler: EventHandler,
  eventBus?: EventBus
): Observer => {
  const bus = eventBus || getGlobalEventBus();
  const observerName = `once_${eventName}`;

  const observer = new Observer(observerName, bus);
  
  observer.onMount = () => {
    observer.subscribe(eventName, (event) => {
      handler(event);
      observer.unmount();
    });
  };

  return observer;
};

/**
 * Creates an observer with debounced handler
 * Delays handler execution until after debounce period
 * 
 * @example
 * ```typescript
 * const debouncedObserver = createDebouncedObserver('task.updated', 300, (event) => {
 *   console.log('Task updated:', event.payload);
 * });
 * debouncedObserver.mount();
 * ```
 */
export const createDebouncedObserver = (
  eventName: string,
  delayMs: number,
  handler: EventHandler,
  eventBus?: EventBus
): Observer => {
  const bus = eventBus || getGlobalEventBus();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const observerName = `debounced_${eventName}`;

  const observer = new Observer(observerName, bus);
  
  observer.onMount = () => {
    observer.subscribe(eventName, (event) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        handler(event);
      }, delayMs);
    });
  };

  observer.onUnmount = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return observer;
};

/**
 * Creates a throttled observer
 * Ensures handler is called at most once per throttle period
 * 
 * @example
 * ```typescript
 * const throttledObserver = createThrottledObserver('task.moved', 500, (event) => {
 *   console.log('Task moved:', event.payload);
 * });
 * throttledObserver.mount();
 * ```
 */
export const createThrottledObserver = (
  eventName: string,
  throttleMs: number,
  handler: EventHandler,
  eventBus?: EventBus
): Observer => {
  const bus = eventBus || getGlobalEventBus();
  let lastCallTime = 0;
  const observerName = `throttled_${eventName}`;

  const observer = new Observer(observerName, bus);
  
  observer.onMount = () => {
    observer.subscribe(eventName, (event) => {
      const now = Date.now();
      if (now - lastCallTime >= throttleMs) {
        lastCallTime = now;
        handler(event);
      }
    });
  };

  return observer;
};

/**
 * Batch multiple events and handle them together
 * Useful for collecting rapid-fire events
 * 
 * @example
 * ```typescript
 * const batchedObserver = createBatchedObserver(['task.created', 'task.updated'], 1000, (events) => {
 *   console.log('Batched events:', events);
 * });
 * batchedObserver.mount();
 * ```
 */
export const createBatchedObserver = (
  eventNames: string[],
  batchDelayMs: number,
  handler: (events: Event[]) => void,
  eventBus?: EventBus
): Observer => {
  const bus = eventBus || getGlobalEventBus();
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const eventBatch: Event[] = [];

  const flushBatch = () => {
    if (eventBatch.length > 0) {
      handler([...eventBatch]);
      eventBatch.length = 0;
    }
  };

  const observer = new Observer(`batched_${eventNames.join('_')}`, bus);
  
  observer.onMount = () => {
    observer.subscribeToMany(eventNames, (event) => {
      eventBatch.push(event);
      
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          flushBatch();
          timeoutId = null;
        }, batchDelayMs);
      }
    });
  };

  observer.onUnmount = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    // Flush any remaining events
    flushBatch();
  };

  return observer;
};

/**
 * Create a scoped observer that can be enabled/disabled
 * Useful for temporary event listening
 * 
 * @example
 * ```typescript
 * const scoped = createScopedObserver('task.created', (event) => {
 *   console.log('Task created:', event.payload);
 * });
 * 
 * // Enable listening
 * scoped.enable();
 * 
 * // Disable listening (subscriptions remain but handlers won't run)
 * scoped.disable();
 * 
 * // Clean up
 * scoped.destroy();
 * ```
 */
export const createScopedObserver = (
  eventName: string,
  handler: EventHandler,
  eventBus?: EventBus
): Observer & { enable: () => void; disable: () => void; destroy: () => void } => {
  const bus = eventBus || getGlobalEventBus();
  let enabled = true;
  let subscription: Subscription | null = null;
  const observerName = `scoped_${eventName}`;

  const observer = new Observer(observerName, bus);
  
  const wrappedHandler: EventHandler = (event) => {
    if (enabled) {
      handler(event);
    }
  };

  observer.onMount = () => {
    subscription = observer.subscribe(eventName, wrappedHandler);
  };

  observer.onUnmount = () => {
    subscription = null;
  };

  return {
    enable: () => {
      enabled = true;
    },
    disable: () => {
      enabled = false;
    },
    destroy: () => {
      observer.unmount();
    },
  } as Observer & { enable: () => void; disable: () => void; destroy: () => void };
};

/**
 * Create an observer that filters events based on a predicate
 * 
 * @example
 * ```typescript
 * const filtered = createFilteredObserver('task.updated', (event) => {
 *   return event.payload.changes.priority !== undefined;
 * }, (event) => {
 *   console.log('Priority changed:', event.payload);
 * });
 * filtered.mount();
 * ```
 */
export const createFilteredObserver = (
  eventName: string,
  predicate: (event: Event) => boolean,
  handler: EventHandler,
  eventBus?: EventBus
): Observer => {
  const bus = eventBus || getGlobalEventBus();
  const observerName = `filtered_${eventName}`;

  const observer = new Observer(observerName, bus);
  
  observer.onMount = () => {
    observer.subscribe(eventName, (event) => {
      if (predicate(event)) {
        handler(event);
      }
    });
  };

  return observer;
};

export default Observer;
