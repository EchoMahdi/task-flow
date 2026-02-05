<?php

namespace App\Services;

use App\Models\JobStatus;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

/**
 * Queue Manager Service
 * 
 * Provides utilities for managing and monitoring the queue system.
 */
class QueueManager
{
    /**
     * Queue configuration prefixes.
     */
    protected const QUEUE_PREFIX = 'queues:';

    /**
     * Get queue length for a specific queue.
     */
    public function getQueueLength(string $queue): int
    {
        $key = self::QUEUE_PREFIX . $queue;
        
        if (config('queue.default') === 'redis') {
            return Redis::llen($key);
        }

        // For database queue, count pending jobs
        return DB::table('jobs')
            ->where('queue', $queue)
            ->where('reserved_at', null)
            ->count();
    }

    /**
     * Get total queue length across all queues.
     */
    public function getTotalQueueLength(): int
    {
        $queues = ['emails', 'notifications', 'default', 'heavy'];
        $total = 0;

        foreach ($queues as $queue) {
            $total += $this->getQueueLength($queue);
        }

        return $total;
    }

    /**
     * Get queue status for all queues.
     */
    public function getQueueStatus(): array
    {
        $queues = ['emails', 'notifications', 'default', 'heavy'];
        $status = [];

        foreach ($queues as $queue) {
            $status[$queue] = [
                'pending' => $this->getQueueLength($queue),
                'processing' => $this->getProcessingCount($queue),
            ];
        }

        $status['total'] = [
            'pending' => array_sum(array_column($status, 'pending')),
            'processing' => array_sum(array_column($status, 'processing')),
        ];

        return $status;
    }

    /**
     * Get number of jobs currently processing.
     */
    protected function getProcessingCount(string $queue): int
    {
        if (config('queue.default') === 'redis') {
            $key = self::QUEUE_PREFIX . $queue . ':processing';
            return Redis::scard($key);
        }

        // For database queue
        return DB::table('jobs')
            ->where('queue', $queue)
            ->whereNotNull('reserved_at')
            ->count();
    }

    /**
     * Get failed job statistics.
     */
    public function getFailedJobStats(): array
    {
        return [
            'total' => DB::table('failed_jobs')->count(),
            'recent_24h' => DB::table('failed_jobs')
                ->where('created_at', '>', now()->subHours(24))
                ->count(),
            'recent_1h' => DB::table('failed_jobs')
                ->where('created_at', '>', now()->subHours(1))
                ->count(),
        ];
    }

    /**
     * Get job status statistics.
     */
    public function getJobStatusStats(): array
    {
        return [
            'pending' => JobStatus::where('status', JobStatus::STATUS_PENDING)->count(),
            'processing' => JobStatus::where('status', JobStatus::STATUS_PROCESSING)->count(),
            'completed' => JobStatus::where('status', JobStatus::STATUS_COMPLETED)->count(),
            'failed' => JobStatus::where('status', JobStatus::STATUS_FAILED)->count(),
            'retrying' => JobStatus::where('status', JobStatus::STATUS_RETRYING)->count(),
            'stuck' => JobStatus::where('status', JobStatus::STATUS_PROCESSING)
                ->where('started_at', '<', now()->subHour())
                ->count(),
        ];
    }

    /**
     * Check if queue health is OK.
     */
    public function isHealthy(): bool
    {
        $stats = $this->getJobStatusStats();
        
        // Check for stuck jobs
        if ($stats['stuck'] > 0) {
            Log::warning("Found {$stats['stuck']} stuck jobs");
            return false;
        }

        // Check for too many recent failures
        $failedStats = $this->getFailedJobStats();
        if ($failedStats['recent_1h'] > 100) {
            Log::warning("High failed job rate: {$failedStats['recent_1h']} in last hour");
            return false;
        }

        return true;
    }

    /**
     * Retry all failed jobs.
     */
    public function retryAllFailedJobs(): int
    {
        $failedIds = DB::table('failed_jobs')
            ->where('created_at', '>', now()->subHours(24))
            ->pluck('id');

        foreach ($failedIds as $id) {
            $this->retryFailedJob($id);
        }

        return count($failedIds);
    }

    /**
     * Retry a specific failed job.
     */
    public function retryFailedJob(string $id): bool
    {
        try {
            Artisan::call("queue:retry {$id}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to retry job {$id}: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Clear all failed jobs older than specified hours.
     */
    public function clearOldFailedJobs(int $hours = 24): int
    {
        return DB::table('failed_jobs')
            ->where('created_at', '<', now()->subHours($hours))
            ->delete();
    }

    /**
     * Get performance metrics.
     */
    public function getPerformanceMetrics(): array
    {
        $completed = JobStatus::where('status', JobStatus::STATUS_COMPLETED)
            ->where('finished_at', '>', now()->subHours(24))
            ->get();

        $durations = $completed->map(function ($job) {
            return $job->finished_at->diffInSeconds($job->started_at);
        })->filter();

        return [
            'jobs_completed_24h' => $completed->count(),
            'avg_duration_seconds' => $durations->avg() ?: 0,
            'min_duration_seconds' => $durations->min() ?: 0,
            'max_duration_seconds' => $durations->max() ?: 0,
            'median_duration_seconds' => $durations->median() ?: 0,
        ];
    }

    /**
     * Monitor queue health and alert if needed.
     */
    public function monitorAndAlert(): void
    {
        $status = $this->getQueueStatus();
        $jobStats = $this->getJobStatusStats();
        $performance = $this->getPerformanceMetrics();

        // Log health status
        Log::channel('queue-monitor')->info('Queue health check', [
            'timestamp' => now()->toIso8601String(),
            'queues' => $status,
            'job_stats' => $jobStats,
            'performance' => $performance,
            'is_healthy' => $this->isHealthy(),
        ]);

        // Alert if unhealthy
        if (!$this->isHealthy()) {
            Log::channel('alerts')->error('Queue health check failed', [
                'job_stats' => $jobStats,
                'queue_status' => $status,
            ]);
        }

        // Alert if queue is backing up
        if ($status['total']['pending'] > 1000) {
            Log::channel('alerts')->warning('Queue backup detected', [
                'pending_jobs' => $status['total']['pending'],
            ]);
        }
    }
}
