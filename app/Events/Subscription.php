<?php

namespace App\Events;

/**
 * Event Subscription
 * 
 * Represents an active subscription to an event.
 * Used for cleanup and managing subscriptions.
 * 
 * @package App\Events
 */
class Subscription
{
    /**
     * Unique identifier for this subscription
     */
    public readonly string $id;

    /**
     * The event name this subscription is listening to
     */
    public readonly string $eventName;

    /**
     * The handler function
     *
     * @var callable
     */
    public $handler;

    /**
     * Options used when creating this subscription
     */
    public readonly array $options;

    /**
     * Whether this subscription is still active
     */
    protected bool $active = true;

    /**
     * Create a new Subscription instance
     * 
     * @param string $id
     * @param string $eventName
     * @param callable $handler
     * @param array{
     *     replay?: bool,
     *     priority?: int,
     *     tag?: string
     * } $options
     */
    public function __construct(
        string $id,
        string $eventName,
        callable $handler,
        array $options = []
    ) {
        $this->id = $id;
        $this->eventName = $eventName;
        $this->handler = $handler;
        $this->options = $options;
    }

    /**
     * Check if subscription is active
     * 
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->active;
    }

    /**
     * Deactivate this subscription
     * 
     * @return void
     */
    public function deactivate(): void
    {
        $this->active = false;
    }

    /**
     * Get the tag associated with this subscription
     * 
     * @return string|null
     */
    public function getTag(): ?string
    {
        return $this->options['tag'] ?? null;
    }

    /**
     * Get the priority of this subscription
     * 
     * @return int
     */
    public function getPriority(): int
    {
        return $this->options['priority'] ?? 0;
    }

    /**
     * Check if replay is enabled for this subscription
     * 
     * @return bool
     */
    public function hasReplay(): bool
    {
        return $this->options['replay'] ?? false;
    }
}
