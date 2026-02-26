<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Event Store Model
 * 
 * Stores events for persistence and replay functionality.
 * Implements event sourcing pattern for optional replay capability.
 * 
 * @property int $id
 * @property string $event_type
 * @property string $event_name
 * @property array $payload
 * @property int|null $aggregate_id
 * @property string|null $aggregate_type
 * @property int $version
 * @property \Carbon\Carbon $occurred_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class EventStore extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'event_store';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'event_type',
        'event_name',
        'payload',
        'aggregate_id',
        'aggregate_type',
        'version',
        'occurred_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'payload' => 'array',
        'aggregate_id' => 'integer',
        'version' => 'integer',
        'occurred_at' => 'datetime',
    ];

    /**
     * Store an event to the event store.
     *
     * @param string $eventType
     * @param string $eventName
     * @param array $payload
     * @param int|null $aggregateId
     * @param string|null $aggregateType
     * @return self
     */
    public static function storeEvent(
        string $eventType,
        string $eventName,
        array $payload,
        ?int $aggregateId = null,
        ?string $aggregateType = null
    ): self {
        // Get the next version for this aggregate
        $version = 1;
        if ($aggregateType && $aggregateId) {
            $version = self::where('aggregate_type', $aggregateType)
                ->where('aggregate_id', $aggregateId)
                ->max('version') + 1;
        }

        return self::create([
            'event_type' => $eventType,
            'event_name' => $eventName,
            'payload' => $payload,
            'aggregate_id' => $aggregateId,
            'aggregate_type' => $aggregateType,
            'version' => $version,
            'occurred_at' => now(),
        ]);
    }

    /**
     * Get events by event name.
     *
     * @param string $eventName
     * @param int|null $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getEventsByName(string $eventName, ?int $limit = null)
    {
        $query = self::where('event_name', $eventName)
            ->orderBy('occurred_at', 'desc');

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Get events for an aggregate.
     *
     * @param string $aggregateType
     * @param int $aggregateId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getEventsForAggregate(string $aggregateType, int $aggregateId)
    {
        return self::where('aggregate_type', $aggregateType)
            ->where('aggregate_id', $aggregateId)
            ->orderBy('occurred_at', 'asc')
            ->get();
    }

    /**
     * Get recent events for replay.
     *
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getRecentEvents(int $limit = 100)
    {
        return self::orderBy('occurred_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
