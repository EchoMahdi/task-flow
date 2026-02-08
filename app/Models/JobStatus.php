<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class JobStatus extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_id',
        'job_class',
        'queue',
        'status',
        'attempts',
        'max_attempts',
        'progress',
        'payload',
        'result',
        'error_message',
        'error_trace',
        'started_at',
        'finished_at',
        'next_retry_at',
    ];

    protected $casts = [
        'attempts' => 'integer',
        'max_attempts' => 'integer',
        'progress' => 'integer',
        'payload' => 'array',
        'result' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'next_retry_at' => 'datetime',
    ];

    // Job statuses
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_RETRYING = 'retrying';
    public const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the user that owns this job status.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a new job status record.
     */
    public static function createForJob(string $jobClass, string $queue, array $payload = []): self
    {
        return static::create([
            'job_id' => uniqid('job_', true),
            'job_class' => $jobClass,
            'queue' => $queue,
            'status' => self::STATUS_PENDING,
            'attempts' => 0,
            'max_attempts' => 3,
            'payload' => $payload,
            'created_at' => now(),
        ]);
    }

    /**
     * Mark job as processing.
     */
    public function markAsProcessing(): self
    {
        $this->update([
            'status' => self::STATUS_PROCESSING,
            'started_at' => now(),
        ]);

        return $this;
    }

    /**
     * Mark job as completed.
     */
    public function markAsCompleted(array $result = []): self
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'finished_at' => now(),
            'result' => $result,
        ]);

        return $this;
    }

    /**
     * Mark job as failed.
     */
    public function markAsFailed(string $errorMessage, string $errorTrace = ''): self
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'finished_at' => now(),
            'error_message' => $errorMessage,
            'error_trace' => $errorTrace,
        ]);

        return $this;
    }

    /**
     * Mark job for retry.
     */
    public function markForRetry(int $delayMinutes = 5): self
    {
        $this->update([
            'status' => self::STATUS_RETRYING,
            'attempts' => $this->attempts + 1,
            'next_retry_at' => now()->addMinutes($delayMinutes),
        ]);

        return $this;
    }

    /**
     * Cancel job.
     */
    public function cancel(): self
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'finished_at' => now(),
        ]);

        return $this;
    }

    /**
     * Update job progress.
     */
    public function updateProgress(int $progress): self
    {
        $this->update(['progress' => min(100, max(0, $progress))]);

        return $this;
    }

    /**
     * Check if job can be retried.
     */
    public function canRetry(): bool
    {
        return $this->attempts < $this->max_attempts && 
               $this->status !== self::STATUS_CANCELLED;
    }

    /**
     * Check if job is finished.
     */
    public function isFinished(): bool
    {
        return in_array($this->status, [
            self::STATUS_COMPLETED,
            self::STATUS_FAILED,
            self::STATUS_CANCELLED,
        ]);
    }

    /**
     * Get human-readable status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'Pending',
            self::STATUS_PROCESSING => 'Processing',
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_FAILED => 'Failed',
            self::STATUS_RETRYING => 'Retrying',
            self::STATUS_CANCELLED => 'Cancelled',
            default => ucfirst($this->status),
        };
    }

    /**
     * Get execution duration in seconds.
     */
    public function getDurationAttribute(): ?int
    {
        if (!$this->started_at) {
            return null;
        }

        $endTime = $this->finished_at ?? now();
        return $endTime->diffInSeconds($this->started_at);
    }

    /**
     * Scope for pending jobs.
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope for processing jobs.
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', self::STATUS_PROCESSING);
    }

    /**
     * Scope for failed jobs.
     */
    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    /**
     * Scope for jobs ready to retry.
     */
    public function scopeReadyToRetry($query)
    {
        return $query->where('status', self::STATUS_RETRYING)
            ->where('next_retry_at', '<=', now());
    }

    /**
     * Scope for user's jobs.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
