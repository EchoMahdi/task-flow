<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Process Event Job
 * 
 * Handles asynchronous event processing through Laravel's queue system.
 * This job is dispatched when events need to be processed in the background.
 * 
 * @package App\Jobs
 */
class ProcessEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 5;

    /**
     * The event name.
     */
    protected string $eventName;

    /**
     * The event payload.
     */
    protected array $payload;

    /**
     * Create a new job instance.
     * 
     * @param string $eventName
     * @param array $payload
     */
    public function __construct(string $eventName, array $payload)
    {
        $this->eventName = $eventName;
        $this->payload = $payload;
        $this->onQueue('events');
    }

    /**
     * Execute the job.
     * 
     * @return void
     */
    public function handle(): void
    {
        $eventBus = app(\App\Events\EventBus::class);
        
        Log::info("Processing async event: {$this->eventName}", [
            'event' => $this->eventName,
            'payload' => $this->payload,
        ]);

        // Process the event synchronously through the event bus
        // This will validate, transform, and notify all subscribers
        $eventBus->emit($this->eventName, $this->payload);
    }

    /**
     * Handle a job failure.
     * 
     * @param \Throwable $exception
     * @return void
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Failed to process event: {$this->eventName}", [
            'event' => $this->eventName,
            'payload' => $this->payload,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Get the tags that should be assigned to the job.
     * 
     * @return array
     */
    public function tags(): array
    {
        return [
            'event',
            'event:' . $this->eventName,
        ];
    }
}
