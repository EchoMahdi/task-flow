<?php

namespace App\Traits;

use App\Models\JobStatus;
use Illuminate\Support\Facades\Log;

/**
 * Job tracking trait for jobs that need detailed status tracking.
 * 
 * Provides:
 * - Automatic job status creation and updates
 * - Progress tracking
 * - Error logging
 * - Result storage
 */
trait JobTracking
{
    /**
     * The job status model instance.
     */
    protected ?JobStatus $jobStatus = null;

    /**
     * Start tracking this job.
     */
    public function startTracking(?string $queue = null): self
    {
        $this->jobStatus = JobStatus::createForJob(
            static::class,
            $queue ?? 'default',
            $this->getTrackingData()
        );

        $this->jobStatus->markAsProcessing();

        return $this;
    }

    /**
     * Get data for tracking initialization.
     */
    protected function getTrackingData(): array
    {
        return [];
    }

    /**
     * Update job progress.
     */
    public function updateProgress(int $progress): self
    {
        if ($this->jobStatus) {
            $this->jobStatus->updateProgress($progress);
        }

        return $this;
    }

    /**
     * Mark job as completed with results.
     */
    public function complete(array $result = []): self
    {
        if ($this->jobStatus) {
            $this->jobStatus->markAsCompleted($result);
        }

        $this->logTracking('Job completed', ['result' => $result]);

        return $this;
    }

    /**
     * Mark job as failed with error.
     */
    public function fail(string $errorMessage, string $trace = ''): self
    {
        if ($this->jobStatus) {
            $this->jobStatus->markAsFailed($errorMessage, $trace);
        }

        $this->logTracking('Job failed', [
            'error' => $errorMessage,
            'trace' => $trace,
        ]);

        return $this;
    }

    /**
     * Mark job for retry.
     */
    public function retry(int $delayMinutes = 5): self
    {
        if ($this->jobStatus) {
            $this->jobStatus->markForRetry($delayMinutes);
        }

        $this->logTracking('Job queued for retry', [
            'delay_minutes' => $delayMinutes,
            'attempts' => $this->jobStatus?->attempts ?? 1,
        ]);

        return $this;
    }

    /**
     * Check if job can be retried.
     */
    public function canRetry(): bool
    {
        return $this->jobStatus?->canRetry() ?? true;
    }

    /**
     * Get job status instance.
     */
    public function getJobStatus(): ?JobStatus
    {
        return $this->jobStatus;
    }

    /**
     * Log tracking event.
     */
    protected function logTracking(string $message, array $context = []): void
    {
        $jobId = $this->jobStatus?->job_id ?? 'unknown';
        
        Log::channel('queue')->info("[{$jobId}] " . static::class . ": {$message}", [
            'job_id' => $jobId,
            ...$context,
        ]);
    }

    /**
     * Add custom metadata to job status.
     */
    public function addMetadata(array $metadata): self
    {
        if ($this->jobStatus) {
            $existing = $this->jobStatus->payload ?? [];
            $this->jobStatus->update(['payload' => array_merge($existing, $metadata)]);
        }

        return $this;
    }

    /**
     * Store result in job status.
     */
    public function storeResult(array $result): self
    {
        if ($this->jobStatus) {
            $existing = $this->jobStatus->result ?? [];
            $this->jobStatus->update(['result' => array_merge($existing, $result)]);
        }

        return $this;
    }

    /**
     * Get current attempt number.
     */
    public function getCurrentAttempt(): int
    {
        return $this->jobStatus?->attempts ?? 1;
    }

    /**
     * Get maximum attempts allowed.
     */
    public function getMaxAttempts(): int
    {
        return $this->jobStatus?->max_attempts ?? 3;
    }

    /**
     * Set maximum attempts.
     */
    public function setMaxAttempts(int $maxAttempts): self
    {
        if ($this->jobStatus) {
            $this->jobStatus->max_attempts = $maxAttempts;
            $this->jobStatus->save();
        }

        return $this;
    }

    /**
     * Mark job as cancelled.
     */
    public function cancel(): self
    {
        if ($this->jobStatus) {
            $this->jobStatus->cancel();
        }

        $this->logTracking('Job cancelled');

        return $this;
    }

    /**
     * Check if job is still active (not completed/failed/cancelled).
     */
    public function isActive(): bool
    {
        if (!$this->jobStatus) {
            return true; // If not tracking, assume active
        }

        return !in_array($this->jobStatus->status, [
            JobStatus::STATUS_COMPLETED,
            JobStatus::STATUS_FAILED,
            JobStatus::STATUS_CANCELLED,
        ]);
    }

    /**
     * Get job status as string.
     */
    public function getStatusLabel(): string
    {
        if (!$this->jobStatus) {
            return 'unknown';
        }

        return match ($this->jobStatus->status) {
            JobStatus::STATUS_PENDING => 'Pending',
            JobStatus::STATUS_PROCESSING => 'Processing',
            JobStatus::STATUS_COMPLETED => 'Completed',
            JobStatus::STATUS_FAILED => 'Failed',
            JobStatus::STATUS_RETRYING => 'Retrying',
            JobStatus::STATUS_CANCELLED => 'Cancelled',
            default => 'Unknown',
        };
    }
}
