# Scheduler & Queue Module - Usage Guide

## Quick Start

### Dispatching Jobs

#### Basic Job Dispatch
```php
use App\Jobs\ProcessNotification;

// Simple dispatch (runs asynchronously)
ProcessNotification::dispatch($notificationRule);

// With delay
ProcessNotification::dispatch($rule)->delay(now()->addMinutes(5));

// On specific queue
ProcessNotification::dispatch($rule)->onQueue('notifications');

// With delay and queue
ProcessNotification::dispatch($rule)
    ->onQueue('notifications')
    ->delay(now()->addMinutes(5));
```

#### Email Job Dispatch
```php
use App\Jobs\SendEmailJob;

// Simple HTML email
SendEmailJob::dispatch(
    $user->email,
    $user->name,
    'Welcome to our app!',
    '<h1>Welcome!</h1><p>Thanks for joining.</p>'
);

// Using view template
SendEmailJob::fromView(
    $user->email,
    $user->name,
    'Your Report is Ready',
    'emails.monthly-report',
    ['report' => $reportData]
)->withMetadata(['type' => 'monthly_report']);
```

#### Heavy Processing Job Dispatch
```php
use App\Console\Commands\GenerateReportJob;

// Dispatch report generation (will use heavy queue)
GenerateReportJob::dispatch(
    'monthly_sales',
    now()->startOfMonth()->toISOString(),
    now()->endOfMonth()->toISOString(),
    auth()->id()
)->onQueue('heavy');
```

## Job Classes

### Extending AbstractJob
```php
<?php

namespace App\Jobs;

use App\Jobs\AbstractJob;

class CustomJob extends AbstractJob
{
    protected string $queue = 'default';

    public function __construct(protected array $data)
    {
        //
    }

    public function handle(): void
    {
        // Process the job
        $this->logInfo('Processing job', ['data' => $this->data]);
        
        // Your logic here
        $result = process_data($this->data);
        
        $this->logInfo('Job completed', ['result' => $result]);
    }

    public function backoff(): array
    {
        return [60, 300, 900]; // Custom retry delays
    }

    public function tags(): array
    {
        return ['custom', $this->data['type'] ?? 'general'];
    }
}
```

### Using JobTracking Trait
```php
<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Traits\JobTracking;

class TrackedJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, JobTracking;

    public function handle(): void
    {
        $this->startTracking('default');
        
        // Your job logic
        $this->updateProgress(50);
        
        // Complete
        $this->complete(['result' => 'success']);
    }
}
```

## Queue Workers

### Starting Workers

#### All Queues
```bash
php artisan queue:work redis --queue=emails,notifications,default,heavy
```

#### Specific Queue
```bash
# Only process emails
php artisan queue:work redis --queue=emails

# Process notifications with high priority
php artisan queue:work redis --queue=notifications --tries=3 --timeout=30
```

#### With Supervisor (Recommended)
```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/artisan queue:work redis --queue=emails,notifications,default,heavy --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/laravel-worker.log
stopwaitsecs=3600
```

### Worker Options
```bash
# Important options
--queue=emails,notifications    # Process specific queues
--tries=3                       # Max retry attempts
--timeout=60                    # Job timeout in seconds
--memory=128                   # Memory limit in MB
--sleep=3                      # Seconds to sleep when no jobs
--max-time=3600                # Max seconds to run
--rest=0.5                     # Seconds to rest between jobs
--once                         # Process one job and exit
```

## Scheduler Commands

### Processing Notifications
```bash
# Manual run
php artisan notifications:process

# Dry run (shows what would be processed)
php artisan notifications:process --dry-run
```

### Monitoring Queue
```bash
# Quick health check
php artisan queue:monitor --check

# Detailed output
php artisan queue:monitor --verbose

# JSON output
php artisan queue:monitor --json
```

### Retry Failed Jobs
```bash
# Retry last 24 hours
php artisan queue:retry-failed

# Retry all
php artisan queue:retry-failed --all

# Specific time range
php artisan queue:retry-failed --hours=48

# Dry run
php artisan queue:retry-failed --dry-run
```

## Scheduled Tasks

### Scheduler Configuration (Kernel.php)
```php
protected function schedule(Schedule $schedule): void
{
    // Process notifications every 5 minutes
    $schedule->command('notifications:process')
        ->everyFiveMinutes()
        ->withoutOverlapping()
        ->onOneServer();

    // Monitor queue health
    $schedule->command('queue:monitor')
        ->everyMinute()
        ->withoutOverlapping();

    // Retry failed jobs hourly
    $schedule->command('queue:retry-failed')
        ->hourly();

    // Clear old failed jobs daily
    $schedule->command('queue:flush')
        ->dailyAt('02:00');
}
```

### Running the Scheduler
```bash
# Run scheduler (typically via cron)
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1

# Or run minute-by-minute
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

## Queue Configuration

### Environment Variables (.env)
```env
# Queue connection
QUEUE_CONNECTION=redis
REDIS_QUEUE=default

# Failed jobs
QUEUE_FAILED_DRIVER=database-uuids

# Monitoring thresholds
QUEUE_ALERT_THRESHOLD=100
QUEUE_BACKUP_THRESHOLD=1000
```

### Queue Connection Settings (config/queue.php)
```php
'emails' => [
    'driver' => 'redis',
    'queue' => 'emails',
    'retry_after' => 120,
    'max_attempts' => 5,
    'timeout' => 60,
    'after_commit' => true,
],

'notifications' => [
    'driver' => 'redis',
    'queue' => 'notifications',
    'retry_after' => 90,
    'max_attempts' => 3,
    'timeout' => 30,
    'after_commit' => true,
],

'heavy' => [
    'driver' => 'redis',
    'queue' => 'heavy',
    'retry_after' => 600,
    'max_attempts' => 2,
    'timeout' => 300,
    'after_commit' => true,
],
```

## Monitoring & Observability

### Log Channels
- `queue.log` - General queue operations
- `email.log` - Email sending results
- `scheduler.log` - Scheduled task execution
- `queue-monitor.log` - Health check results
- `alerts.log` - Critical alerts and failures
- `heavy.log` - Heavy processing operations

### Checking Job Status
```php
use App\Models\JobStatus;

// Get job status
$status = JobStatus::where('job_id', $jobId)->first();

// Status types
$status->status; // pending, processing, completed, failed, retrying

// Check if failed
if ($status->status === JobStatus::STATUS_FAILED) {
    echo $status->error_message;
}

// Get attempts
echo $status->attempts;
```

### Queue Statistics
```php
use App\Services\QueueManager;

$manager = new QueueManager();

// Get queue status
$status = $manager->getQueueStatus();
// [
//     'emails' => ['pending' => 10, 'processing' => 2],
//     'notifications' => ['pending' => 5, 'processing' => 1],
//     ...
// ]

// Check health
if ($manager->isHealthy()) {
    echo "Queue is healthy";
}

// Get performance metrics
$metrics = $manager->getPerformanceMetrics();
// [
//     'jobs_completed_24h' => 1500,
//     'avg_duration_seconds' => 0.5,
//     ...
// ]
```

## Best Practices

### 1. Idempotent Jobs
```php
class PaymentJob implements ShouldQueue
{
    public function handle(): void
    {
        // Check if already processed
        if (Payment::where('transaction_id', $this->transactionId)->exists()) {
            $this->logInfo('Payment already processed, skipping');
            return;
        }
        
        // Process payment
        // ...
    }
}
```

### 2. Fresh Data in Handle
```php
public function handle(): void
{
    // Always get fresh data
    $rule = $this->rule->fresh();
    
    if (!$rule || !$rule->is_enabled) {
        return;
    }
    
    // Process with fresh data
    // ...
}
```

### 3. Proper Error Handling
```php
public function handle(): void
{
    try {
        // Primary logic
        $this->process();
        
    } catch (TemporaryException $e) {
        // Retryable error - release job
        $this->release(60);
        
    } catch (PermanentException $e) {
        // Non-retryable - fail without retry
        $this->fail($e->getMessage());
        
    } catch (\Exception $e) {
        // Other errors - retry with backoff
        throw $e; // Let queue worker handle retry
    }
}
```

### 4. Memory Management
```php
class ImportJob implements ShouldQueue
{
    public function handle(): void
    {
        $items = Item::chunk(100, function ($chunk) {
            foreach ($chunk as $item) {
                // Process item
                $item->update(['imported' => true]);
            }
            
            // Clear memory
            gc_collect_cycles();
        });
    }
}
```

### 5. Unique Jobs
```php
class SendNewsletterJob implements ShouldQueue, ShouldBeUnique
{
    public function uniqueId(): string
    {
        return "newsletter_{$this->newsletterId}_{$this->userId}";
    }

    public function uniqueFor(): int
    {
        return 3600; // Lock expires after 1 hour
    }
}
```

## Troubleshooting

### Jobs Not Processing
1. Check Redis connection
2. Verify queue configuration
3. Check worker status: `php artisan queue:monitor --check`
4. Review logs: `tail -f storage/logs/queue.log`

### Duplicate Jobs
1. Implement `uniqueId()` method
2. Check for duplicate dispatches
3. Review idempotency implementation

### Memory Issues
1. Increase chunk size
2. Call `gc_collect_cycles()`
3. Increase worker memory limit

### Failed Jobs
```bash
# List failed jobs
php artisan queue:failed

# Retry specific job
php artisan queue:retry {id}

# Retry all
php artisan queue:retry all

# View failure details
php artisan queue:failed --verbose
```

## Performance Tuning

### Database Indexes
Ensure proper indexes on job tables:
- `jobs.queue`
- `jobs.reserved_at`
- `failed_jobs.id`
- `job_statuses.status`

### Caching
- Cache frequently accessed data
- Use `->fresh()` instead of caching model instances

### Batching
```php
use Illuminate\Bus\Batch;

$batch = Bus::batch([
    new ProcessChunk(1),
    new ProcessChunk(2),
    new ProcessChunk(3),
])->then(function (Batch $batch) {
    // All jobs completed
})->catch(function (Batch $batch, Throwable $e) {
    // First job failure
})->dispatch();

return $batch->id;
```
