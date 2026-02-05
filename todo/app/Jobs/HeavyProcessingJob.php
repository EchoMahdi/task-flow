<?php

namespace App\Jobs;

use App\Traits\JobTracking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Abstract base class for heavy processing jobs
 * 
 * Features:
 * - Progress tracking
 * - Memory management
 * - Chunk-based processing
 * - Automatic retry with exponential backoff
 */
abstract class HeavyProcessingJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;
    
    // حل تداخل trait: از fail متعلق به InteractsWithQueue استفاده می‌کنیم
    // و fail از JobTracking را با نام trackJobFailure در دسترس قرار می‌دهیم
    use InteractsWithQueue, JobTracking {
        InteractsWithQueue::fail insteadof JobTracking;
        JobTracking::fail as trackJobFailure;
    }

    /**
     * Maximum memory usage in MB before triggering cleanup
     */
    protected int $maxMemoryMB = 512;

    /**
     * Number of items to process per chunk
     */
    protected int $chunkSize = 100;

    /**
     * Maximum number of retry attempts
     */
    public int $tries = 3;

    /**
     * Number of seconds to wait before retrying
     */
    public int $backoff = 300;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->startTracking('heavy');

        try {
            $items = $this->getItems();
            $total = count($items);

            if ($total === 0) {
                $this->complete(['message' => 'No items to process']);
                return;
            }

            $this->logTracking("Starting processing of {$total} items");

            $results = [];
            $chunks = array_chunk($items, $this->chunkSize);
            $processed = 0;

            foreach ($chunks as $index => $chunk) {
                // Check memory usage before processing each chunk
                $this->checkMemoryUsage();

                // Update progress
                $progress = (int) (($processed / $total) * 100);
                $this->updateProgress($progress);

                // Process chunk
                $chunkResults = $this->processChunk($chunk);
                $results = array_merge($results, $chunkResults);
                $processed += count($chunk);

                $this->logTracking("Processed chunk " . ($index + 1) . "/" . count($chunks), [
                    'processed' => $processed,
                    'total' => $total,
                    'progress' => $progress . '%',
                ]);
            }

            // Complete with final results
            $this->complete([
                'total_items' => $total,
                'processed_items' => $processed,
                'results' => $results,
                'memory_peak_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
                'execution_time' => $this->getExecutionTime(),
            ]);

        } catch (Throwable $e) {
            $this->handleFailure($e);
            throw $e;
        }
    }

    /**
     * Check and manage memory usage.
     */
    protected function checkMemoryUsage(): void
    {
        $usedMB = memory_get_usage(true) / 1024 / 1024;
        
        if ($usedMB >= $this->maxMemoryMB) {
            Log::channel('heavy')->warning("Memory limit reached ({$usedMB}MB), triggering garbage collection");
            
            // Trigger garbage collection
            gc_collect_cycles();

            // Check again after GC
            $usedMB = memory_get_usage(true) / 1024 / 1024;
            
            // If still over limit, release job back to queue
            if ($usedMB >= $this->maxMemoryMB) {
                Log::channel('heavy')->warning("Memory still high after GC, releasing job");
                $this->release(60); // Retry after 1 minute
            }
        }
    }

    /**
     * Handle job failure.
     */
    protected function handleFailure(Throwable $e): void
    {
        // استفاده از متد tracking که نام آن را تغییر داده‌ایم
        $this->trackJobFailure($e->getMessage(), $e->getTraceAsString());
        
        Log::channel('heavy')->error('Heavy processing job failed', [
            'job_class' => static::class,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'memory_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
            'attempt' => $this->attempts(),
            'max_tries' => $this->tries,
        ]);

        // Auto-retry with backoff if attempts remain
        if ($this->canRetry()) {
            $delay = $this->getRetryDelay();
            Log::channel('heavy')->info("Job will retry in {$delay} seconds", [
                'attempt' => $this->attempts() + 1,
            ]);
            $this->release($delay);
        }
    }

    /**
     * Check if job can be retried.
     */
    protected function canRetry(): bool
    {
        return $this->attempts() < $this->tries;
    }

    /**
     * Get retry delay in seconds with exponential backoff.
     */
    protected function getRetryDelay(): int
    {
        return match ($this->attempts()) {
            1 => 300,     // 5 minutes
            2 => 900,     // 15 minutes
            default => 1800,  // 30 minutes
        };
    }

    /**
     * Get execution time in seconds.
     */
    protected function getExecutionTime(): float
    {
        // این متد باید در JobTracking trait پیاده‌سازی شده باشد
        // یا می‌توانید اینجا پیاده‌سازی کنید
        return 0; // Placeholder
    }

    /**
     * Get tags for monitoring and filtering.
     */
    public function tags(): array
    {
        return ['heavy', 'processing', static::class];
    }

    /**
     * Get items to process.
     * 
     * Must be implemented by child classes.
     * 
     * @return array
     */
    abstract protected function getItems(): array;

    /**
     * Process a chunk of items.
     * 
     * Must be implemented by child classes.
     * 
     * @param array $chunk
     * @return array Results from processing the chunk
     */
    abstract protected function processChunk(array $chunk): array;
}
