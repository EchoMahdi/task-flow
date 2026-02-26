<?php

namespace App\Traits;

use App\Models\EventStore;
use Illuminate\Support\Facades\App;

/**
 * Records Events Trait
 * 
 * Provides automatic event persistence to the event store.
 * Use this trait in event classes that need replay/persistence.
 * 
 * Usage:
 *   In your event class:
 *       use RecordsEvents;
 *       
 *       public function __construct(array $payload)
 *       {
 *           $this->persistEvent('tasks.created', $payload, $payload['taskId'] ?? null, Task::class);
 *       }
 */
trait RecordsEvents
{
    /**
     * Persist the event to the event store.
     *
     * @param string $eventName
     * @param array $payload
     * @param int|null $aggregateId
     * @param string|null $aggregateType
     * @return void
     */
    protected function persistEvent(
        string $eventName,
        array $payload,
        ?int $aggregateId = null,
        ?string $aggregateType = null
    ): void {
        // Skip persistence in test environment or if disabled
        if (App::runningUnitTests() || !config('events.persist', true)) {
            return;
        }

        try {
            EventStore::storeEvent(
                static::class,
                $eventName,
                $payload,
                $aggregateId,
                $aggregateType
            );
        } catch (\Exception $e) {
            // Log error but don't fail the event dispatch
            \Illuminate\Support\Facades\Log::error('Failed to persist event', [
                'event' => static::class,
                'event_name' => $eventName,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Replay events from the event store.
     *
     * @param string $eventName
     * @param int|null $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function replay(string $eventName, ?int $limit = null)
    {
        return EventStore::getEventsByName($eventName, $limit);
    }

    /**
     * Replay events for a specific aggregate.
     *
     * @param string $aggregateType
     * @param int $aggregateId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function replayForAggregate(string $aggregateType, int $aggregateId)
    {
        return EventStore::getEventsForAggregate($aggregateType, $aggregateId);
    }
}
