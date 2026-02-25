<?php

namespace App\Events;

use App\Events\Contracts\EventContract;
use App\Events\Exceptions\EventValidationException;
use App\Jobs\ProcessEventJob;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Event Bus - Core event handling system
 * 
 * Provides synchronous and asynchronous event emission with support for:
 * - Event subscription and unsubscription
 * - Event validation through contracts
 * - Async event processing
 * - Event replay for late subscribers
 * - Error handling and logging
 * 
 * @package App\Events
 */
class EventBus
{
    /**
     * Registered event handlers
     * @var array<string, array<int, array{callable: callable, options: array}>
     */
    protected array $handlers = [];

    /**
     * Event contracts for validation
     * @var array<string, EventContract>
     */
    protected array $contracts = [];

    /**
     * Replay buffer for storing recent events
     * @var array<string, array<int, array{name: string, payload: array, timestamp: int}>>
     */
    protected array $replayBuffer = [];

    /**
     * Maximum number of events to store in replay buffer per event type
     */
    protected int $replayBufferSize = 10;

    /**
     * Whether to handle errors in event handlers
     */
    protected bool $handleErrors = true;

    /**
     * Whether to debug events
     */
    protected bool $debug = false;

    /**
     * Whether async processing is enabled
     */
    protected bool $asyncEnabled = true;

    /**
     * Create a new EventBus instance
     * 
     * @param array{
     *     replay_buffer_size?: int,
     *     handle_errors?: bool,
     *     debug?: bool,
     *     async?: bool
     * } $config
     */
    public function __construct(array $config = [])
    {
        $this->replayBufferSize = $config['replay_buffer_size'] ?? 10;
        $this->handleErrors = $config['handle_errors'] ?? true;
        $this->debug = $config['debug'] ?? config('app.debug', false);
        $this->asyncEnabled = $config['async'] ?? config('events.async', true);
    }

    /**
     * Emit an event synchronously to all subscribers
     * 
     * @param string $eventName
     * @param array $payload
     * @return void
     */
    public function emit(string $eventName, array $payload = []): void
    {
        $payload = $this->preparePayload($eventName, $payload);
        
        $this->log('debug', "Event emitted: {$eventName}", $payload);
        
        // Store in replay buffer
        $this->storeInReplayBuffer($eventName, $payload);
        
        // Validate payload if contract exists
        $this->validatePayload($eventName, $payload);
        
        // Get handlers for this event
        $handlers = $this->getHandlers($eventName);
        
        foreach ($handlers as $handler) {
            $this->executeHandler($handler, $eventName, $payload);
        }
    }

    /**
     * Emit an event asynchronously (non-blocking via queue)
     * 
     * This dispatches the event to Laravel's queue system for processing
     * in the background, allowing the main request to complete quickly.
     * 
     * @param string $eventName
     * @param array $payload
     * @return void
     */
    public function emitAsync(string $eventName, array $payload = []): void
    {
        // Prepare and validate payload before queueing
        $preparedPayload = $this->preparePayload($eventName, $payload);
        
        // Store in replay buffer for late subscribers
        $this->storeInReplayBuffer($eventName, $preparedPayload);
        
        // Validate payload (will throw if invalid)
        $this->validatePayload($eventName, $preparedPayload);

        $this->log('debug', "Event queued asynchronously: {$eventName}", $preparedPayload);

        // Dispatch to queue if async is enabled
        if ($this->asyncEnabled) {
            ProcessEventJob::dispatch($eventName, $preparedPayload)
                ->onQueue(config('events.queue.name', 'events'))
                ->onConnection(config('events.queue.connection', 'redis'));
        } else {
            // Fallback to synchronous processing
            $this->emit($eventName, $preparedPayload);
        }
    }

    /**
     * Check if async processing is enabled
     * 
     * @return bool
     */
    public function isAsyncEnabled(): bool
    {
        return $this->asyncEnabled;
    }

    /**
     * Subscribe to an event
     * 
     * @param string $eventName
     * @param callable $handler
     * @param array{
     *     replay?: bool,
     *     priority?: int,
     *     tag?: string
     * } $options
     * @return Subscription
     */
    public function subscribe(string $eventName, callable $handler, array $options = []): Subscription
    {
        $subscription = new Subscription(
            Str::uuid()->toString(),
            $eventName,
            $handler,
            $options
        );

        // Add to handlers list
        if (!isset($this->handlers[$eventName])) {
            $this->handlers[$eventName] = [];
        }

        // Sort by priority (higher priority first)
        $priority = $options['priority'] ?? 0;
        $this->handlers[$eventName][] = [
            'subscription' => $subscription,
            'handler' => $handler,
            'options' => $options,
            'priority' => $priority,
        ];

        // Re-sort by priority descending
        usort($this->handlers[$eventName], function ($a, $b) {
            return $b['priority'] - $a['priority'];
        });

        $this->log('debug', "Handler subscribed to: {$eventName}");

        // If replay is enabled, replay recent events
        if ($options['replay'] ?? false) {
            $this->replayEvents($eventName, $handler);
        }

        return $subscription;
    }

    /**
     * Subscribe to multiple events with the same handler
     * 
     * @param string[] $eventNames
     * @param callable $handler
     * @param array $options
     * @return Subscription[]
     */
    public function subscribeToMany(array $eventNames, callable $handler, array $options = []): array
    {
        $subscriptions = [];
        
        foreach ($eventNames as $eventName) {
            $subscriptions[] = $this->subscribe($eventName, $handler, $options);
        }
        
        return $subscriptions;
    }

    /**
     * Unsubscribe from an event
     * 
     * @param Subscription $subscription
     * @return void
     */
    public function unsubscribe(Subscription $subscription): void
    {
        $eventName = $subscription->eventName;
        
        if (!isset($this->handlers[$eventName])) {
            return;
        }

        $this->handlers[$eventName] = array_filter(
            $this->handlers[$eventName],
            function ($handler) use ($subscription) {
                return $handler['subscription']->id !== $subscription->id;
            }
        );

        // Clean up empty event handlers
        if (empty($this->handlers[$eventName])) {
            unset($this->handlers[$eventName]);
        }

        $this->log('debug', "Handler unsubscribed from: {$eventName}");
    }

    /**
     * Unsubscribe all handlers matching the given criteria
     * 
     * @param string|null $eventName
     * @param string|null $tag
     * @return int Number of unsubscribed handlers
     */
    public function unsubscribeAll(?string $eventName = null, ?string $tag = null): int
    {
        $count = 0;

        if ($eventName) {
            // Unsubscribe from specific event
            if (isset($this->handlers[$eventName])) {
                $originalCount = count($this->handlers[$eventName]);
                
                if ($tag) {
                    $this->handlers[$eventName] = array_filter(
                        $this->handlers[$eventName],
                        function ($handler) use ($tag, &$count) {
                            if (($handler['options']['tag'] ?? null) === $tag) {
                                $count++;
                                return false;
                            }
                            return true;
                        }
                    );
                } else {
                    $count += $originalCount;
                    $this->handlers[$eventName] = [];
                }

                // Clean up empty handlers
                if (empty($this->handlers[$eventName])) {
                    unset($this->handlers[$eventName]);
                }
            }
        } elseif ($tag) {
            // Unsubscribe from all events with specific tag
            foreach ($this->handlers as $eventName => $handlers) {
                $originalCount = count($handlers);
                
                $this->handlers[$eventName] = array_filter(
                    $handlers,
                    function ($handler) use ($tag, &$count) {
                        if (($handler['options']['tag'] ?? null) === $tag) {
                            $count++;
                            return false;
                        }
                        return true;
                    }
                );

                // Clean up empty handlers
                if (empty($this->handlers[$eventName])) {
                    unset($this->handlers[$eventName]);
                }
            }
        }

        return $count;
    }

    /**
     * Register an event contract for validation
     * 
     * @param string $eventName
     * @param EventContract $contract
     * @return void
     */
    public function registerContract(string $eventName, EventContract $contract): void
    {
        $this->contracts[$eventName] = $contract;
        $this->log('debug', "Contract registered for: {$eventName}");
    }

    /**
     * Check if an event has a registered contract
     * 
     * @param string $eventName
     * @return bool
     */
    public function hasContract(string $eventName): bool
    {
        return isset($this->contracts[$eventName]);
    }

    /**
     * Get the contract for an event
     * 
     * @param string $eventName
     * @return EventContract|null
     */
    public function getContract(string $eventName): ?EventContract
    {
        return $this->contracts[$eventName] ?? null;
    }

    /**
     * Check if an event name is valid (has handlers or contract)
     * 
     * @param string $eventName
     * @return bool
     */
    public function isValidEvent(string $eventName): bool
    {
        return isset($this->handlers[$eventName]) || isset($this->contracts[$eventName]);
    }

    /**
     * Get all registered event names
     * 
     * @return string[]
     */
    public function getRegisteredEvents(): array
    {
        return array_unique(array_merge(
            array_keys($this->handlers),
            array_keys($this->contracts)
        ));
    }

    /**
     * Get handler count for an event
     * 
     * @param string $eventName
     * @return int
     */
    public function getHandlerCount(string $eventName): int
    {
        return count($this->handlers[$eventName] ?? []);
    }

    /**
     * Clear all handlers for an event
     * 
     * @param string|null $eventName
     * @return void
     */
    public function clear(?string $eventName = null): void
    {
        if ($eventName) {
            unset($this->handlers[$eventName]);
        } else {
            $this->handlers = [];
            $this->replayBuffer = [];
        }
    }

    /**
     * Prepare payload with default fields
     * 
     * @param string $eventName
     * @param array $payload
     * @return array
     */
    protected function preparePayload(string $eventName, array $payload): array
    {
        return array_merge($payload, [
            'timestamp' => $payload['timestamp'] ?? time(),
            'source' => $payload['source'] ?? 'backend',
            'eventId' => $payload['eventId'] ?? Str::uuid()->toString(),
        ]);
    }

    /**
     * Store event in replay buffer
     * 
     * @param string $eventName
     * @param array $payload
     * @return void
     */
    protected function storeInReplayBuffer(string $eventName, array $payload): void
    {
        if (!isset($this->replayBuffer[$eventName])) {
            $this->replayBuffer[$eventName] = [];
        }

        $this->replayBuffer[$eventName][] = [
            'name' => $eventName,
            'payload' => $payload,
            'timestamp' => $payload['timestamp'],
        ];

        // Trim buffer to max size
        if (count($this->replayBuffer[$eventName]) > $this->replayBufferSize) {
            array_shift($this->replayBuffer[$eventName]);
        }
    }

    /**
     * Get replay buffer for an event
     * 
     * @param string $eventName
     * @return array
     */
    public function getReplayBuffer(string $eventName): array
    {
        return $this->replayBuffer[$eventName] ?? [];
    }

    /**
     * Replay recent events to a new handler
     * 
     * @param string $eventName
     * @param callable $handler
     * @return void
     */
    protected function replayEvents(string $eventName, callable $handler): void
    {
        $events = $this->getReplayBuffer($eventName);
        
        foreach ($events as $event) {
            $this->executeHandler(['handler' => $handler], $event['name'], $event['payload']);
        }
    }

    /**
     * Validate payload against event contract
     * 
     * @param string $eventName
     * @param array $payload
     * @throws EventValidationException
     * @return void
     */
    protected function validatePayload(string $eventName, array $payload): void
    {
        if (!isset($this->contracts[$eventName])) {
            return;
        }

        $contract = $this->contracts[$eventName];
        
        if (!$contract->validate($payload)) {
            $this->log('warning', "Event validation failed: {$eventName}", $payload);
            throw new EventValidationException(
                "Event validation failed for: {$eventName}",
                0,
                null,
                $eventName,
                $payload
            );
        }
    }

    /**
     * Get handlers for an event (including wildcard handlers)
     * 
     * @param string $eventName
     * @return array
     */
    protected function getHandlers(string $eventName): array
    {
        $handlers = [];
        
        // Direct handlers
        if (isset($this->handlers[$eventName])) {
            $handlers = array_merge($handlers, $this->handlers[$eventName]);
        }
        
        // Wildcard handlers (e.g., "tasks.*" matches "tasks.created")
        foreach ($this->handlers as $pattern => $patternHandlers) {
            if ($this->matchesWildcard($pattern, $eventName)) {
                $handlers = array_merge($handlers, $patternHandlers);
            }
        }
        
        return $handlers;
    }

    /**
     * Check if an event name matches a wildcard pattern
     * 
     * @param string $pattern
     * @param string $eventName
     * @return bool
     */
    protected function matchesWildcard(string $pattern, string $eventName): bool
    {
        if (strpos($pattern, '*') === false) {
            return false;
        }

        $regex = str_replace(['*', '.'], ['.*', '\.'], $pattern);
        return (bool) preg_match("/^{$regex}$/", $eventName);
    }

    /**
     * Execute an event handler
     * 
     * @param array $handler
     * @param string $eventName
     * @param array $payload
     * @return void
     */
    protected function executeHandler(array $handler, string $eventName, array $payload): void
    {
        $callable = $handler['handler'];
        
        try {
            if ($this->handleErrors) {
                try {
                    $callable($payload);
                } catch (\Exception $e) {
                    $this->log('error', "Error in event handler for {$eventName}: " . $e->getMessage(), [
                        'exception' => $e->getMessage(),
                        'payload' => $payload,
                    ]);
                }
            } else {
                $callable($payload);
            }
        } catch (\Throwable $e) {
            $this->log('error', "Fatal error in event handler for {$eventName}: " . $e->getMessage(), [
                'exception' => $e->getMessage(),
                'payload' => $payload,
            ]);
            
            if (!$this->handleErrors) {
                throw $e;
            }
        }
    }

    /**
     * Log a message
     * 
     * @param string $level
     * @param string $message
     * @param array $context
     * @return void
     */
    protected function log(string $level, string $message, array $context = []): void
    {
        if (!$this->debug && $level === 'debug') {
            return;
        }

        Log::$level($message, $context);
    }
}
