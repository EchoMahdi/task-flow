<?php

namespace App\Jobs;

use App\Models\JobStatus;
use App\Traits\JobTracking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Abstract base job class providing common functionality for all jobs.
 * 
 * Features:
 * - Automatic job status tracking
 * - Comprehensive logging
 * - Error handling with proper failure callbacks
 * - Performance monitoring
 */
abstract class AbstractJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The job status instance for tracking.
     */
    protected ?JobStatus $jobStatus = null;

    /**
     * Unique job identifier for tracking.
     */
    protected string $jobId;

    /**
     * Execution timeout in seconds.
     */
    public int $timeout = 60;

    /**
     * Maximum number of exceptions before failing.
     */
    public int $maxExceptions = 3;

    /**
     * Number of retry attempts.
     */
    public int $tries = 3;

    /**
     * Whether the job should be dispatched after database transactions commit.
     */
    public bool $afterCommit = false;

    /**
     * Queue name for this job.
     */
    protected string $queue = 'default';

    /**
     * Priority level (higher = more important).
     */
    protected int $priority = 0;

    /**
     * Start time for execution tracking.
     */
    protected float $startTime;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        $this->jobId = $this->generateJobId();
        $this->startTime = microtime(true);
    }

    /**
     * Generate unique job ID.
     */
    protected function generateJobId(): string
    {
        return uniqid('job_', true);
    }

    /**
     * Get the unique job ID.
     */
    public function getJobId(): string
    {
        return $this->jobId;
    }

    /**
     * Get the queue for this job.
     */
    public function getQueue(): string
    {
        return $this->queue;
    }

    /**
     * Get the priority level.
     */
    public function getPriority(): int
    {
        return $this->priority;
    }

    /**
     * Get retry delay in seconds for each attempt.
     */
    public function backoff(): array
    {
        return [60, 300, 900]; // 1min, 5min, 15min
    }

    /**
     * Get retry delay for specific attempt.
     */
    public function getRetryDelay(int $attempt): int
    {
        $backoff = $this->backoff();
        return $backoff[$attempt - 1] ?? 300;
    }

    /**
     * Get the job payload for logging.
     */
    public function getPayload(): array
    {
        return [
            'job_id' => $this->jobId,
            'job_class' => static::class,
            'queue' => $this->getQueue(),
            'attempts' => $this->attempts(),
            'max_tries' => $this->tries,
        ];
    }

    /**
     * Execute the job.
     */
    abstract public function handle(): void;

    /**
     * Handle a job failure.
     */
    public function failed(Throwable $exception): void
    {
        $this->logError("Job failed: {$exception->getMessage()}", [
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
            'attempts' => $this->attempts(),
        ]);

        // Update job status if tracking
        if ($this->jobStatus) {
            $this->jobStatus->markForRetry($this->getRetryDelay($this->attempts()));
        }

        // Could trigger alerts here
        $this->triggerFailureAlert($exception);
    }

    /**
     * Called before job execution.
     */
    protected function beforeHandle(): void
    {
        $this->createJobStatus();
        $this->logInfo('Job started', $this->getPayload());
    }

    /**
     * Called after successful job execution.
     */
    protected function afterHandle(): void
    {
        if ($this->jobStatus) {
            $this->jobStatus->markAsCompleted([
                'completed_at' => now()->toIso8601String(),
            ]);
        }

        $this->logInfo('Job completed successfully', [
            'job_id' => $this->jobId,
            'duration' => $this->getExecutionTime(),
        ]);
    }

    /**
     * Create job status record.
     */
    protected function createJobStatus(): void
    {
        try {
            $this->jobStatus = JobStatus::createForJob(
                static::class,
                $this->getQueue(),
                $this->getPayload()
            );
        } catch (\Exception $e) {
            Log::warning("Failed to create job status: {$e->getMessage()}");
        }
    }

    /**
     * Log info message.
     */
    protected function logInfo(string $message, array $context = []): void
    {
        Log::channel('queue')->info($this->formatLogMessage($message), $context);
    }

    /**
     * Log warning message.
     */
    protected function logWarning(string $message, array $context = []): void
    {
        Log::channel('queue')->warning($this->formatLogMessage($message), $context);
    }

    /**
     * Log error message.
     */
    protected function logError(string $message, array $context = []): void
    {
        Log::channel('queue')->error($this->formatLogMessage($message), $context);
    }

    /**
     * Format log message with job context.
     */
    protected function formatLogMessage(string $message): string
    {
        return "[{$this->jobId}] " . static::class . ": {$message}";
    }

    /**
     * Trigger alert for job failure.
     */
    protected function triggerFailureAlert(Throwable $exception): void
    {
        // Implementation for alerts (email, Slack, etc.)
        Log::channel('alerts')->error('Job failure alert', [
            'job_id' => $this->jobId,
            'job_class' => static::class,
            'queue' => $this->getQueue(),
            'exception' => $exception->getMessage(),
            'attempts' => $this->attempts(),
        ]);
    }

    /**
     * Get execution time in seconds.
     */
    protected function getExecutionTime(): float
    {
        return microtime(true) - $this->startTime;
    }

    /**
     * Get job tags for monitoring.
     */
    public function tags(): array
    {
        return [static::class, $this->getQueue()];
    }

    /**
     * Determine if job should be unique.
     */
    public function uniqueId(): ?string
    {
        return null; // Override in subclasses if needed
    }

    /**
     * Determine if job should expire.
     */
    public function expires(): ?int
    {
        return null; // No expiration by default
    }
}
