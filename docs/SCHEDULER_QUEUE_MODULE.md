# Scheduler & Queue Module Architecture

## Overview

This document describes the comprehensive Scheduler & Queue module implemented as a critical infrastructure component for background job processing, email notifications, scheduled tasks, and heavy processing operations.

## Architecture Principles

1. **Queue-First Architecture**: All background operations use Laravel's queue system
2. **Multiple Queue Types**: Separate queues for emails, notifications, default, and heavy processing
3. **Fault-Tolerant Design**: Automatic retries, graceful failure handling, and job persistence
4. **Horizontal Scalability**: Support for multiple worker instances
5. **Idempotent Jobs**: Safe to retry without side effects
6. **Comprehensive Monitoring**: Job status tracking, logging, and alerting

## Module Components

```
todo/
├── app/
│   ├── Console/
│   │   ├── Kernel.php              # Scheduler configuration
│   │   └── Commands/
│   │       ├── ProcessNotificationReminders.php
│   │       ├── MonitorQueue.php     # Queue monitoring command
│   │       └── RetryFailedJobs.php  # Retry failed jobs
│   ├── Jobs/
│   │   ├── AbstractJob.php          # Base job class
│   │   ├── RetryableJob.php        # Job with configurable retries
│   │   ├── ProcessNotification.php  # Notification processing
│   │   ├── SendEmailJob.php         # Generic email sending
│   │   ├── HeavyProcessingJob.php  # Heavy processing base
│   │   └── JobLogger.php           # Job execution logging
│   ├── Services/
│   │   ├── QueueManager.php         # Queue management service
│   │   ├── NotificationService.php  # Notification orchestration
│   │   └── SchedulerService.php     # Scheduled task management
│   ├── Traits/
│   │   ├── QueueableJob.php         # Queue configuration traits
│   │   ├── Retryable.php            # Retry logic traits
│   │   └── JobTracking.php         # Job status tracking
│   └── Events/
│       ├── JobProcessed.php
│       ├── JobFailed.php
│       └── JobRetrying.php
├── Models/
│   ├── JobStatus.php                # Job status tracking
│   ├── NotificationRule.php         # Notification scheduling
│   └── NotificationLog.php          # Notification history
└── config/
    └── queue.php                    # Queue configuration
```

## Queue Types

### 1. Default Queue (`default`)
- General-purpose background jobs
- Low to medium priority tasks
- Processing time: < 30 seconds typical

### 2. Email Queue (`emails`)
- Email sending jobs
- Higher reliability requirements
- Automatic retry with exponential backoff

### 3. Notification Queue (`notifications`)
- Time-sensitive notifications
- High priority for user engagement
- Quick processing required

### 4. Heavy Queue (`heavy`)
- Resource-intensive operations
- Longer execution times allowed
- Lower priority during peak hours

## Job Lifecycle

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PENDING   │────▶│  PROCESSING │────▶│  COMPLETED   │     │   FAILED    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                    ▲                    │
                           │                    │                    │
                           ▼                    │                    ▼
                     ┌─────────────┐            │              ┌─────────────┐
                     │  RETRYING   │────────────┘              │  RETRYABLE  │
                     └─────────────┘                           └─────────────┘
```

## Job Execution Flow

### 1. Job Dispatch
```php
// Synchronous dispatch (fire and forget)
SendEmailJob::dispatch($emailData)->onQueue('emails');

// Delayed dispatch (execute after delay)
ProcessNotification::dispatch($rule)->delay(now()->addMinutes(5));

// Scheduled dispatch (at specific time)
HeavyProcessingJob::dispatch($data)->onQueue('heavy')->delayUntil($scheduledTime);
```

### 2. Queue Worker Processing
```bash
# Start all queues
php artisan queue:work redis --queue=emails,notifications,default,heavy

# Or start specific queue
php artisan queue:work redis --queue=notifications --tries=3 --timeout=60
```

### 3. Job Execution
1. Worker fetches job from queue
2. Job is instantiated with payload
3. `handle()` method executes
4. Job status updated to COMPLETED
5. Job removed from queue

### 4. Failure Handling
1. Job fails (exception thrown)
2. `failed()` callback executed
3. Job released back to queue (if retries remaining)
4. Job moved to failed queue (if max retries exceeded)
5. Alert triggered for critical failures

## Retry Strategy

### Exponential Backoff
```php
// Example retry configuration
 retry_after = 90 (seconds)
 max_attempts = 3
 retry_delay = [60, 300, 900] // 1min, 5min, 15min
```

### Retry Logic
```php
// In RetryableJob class
public function retryDelay(): array
{
    return [
        1 => 60,    // First retry after 1 minute
        2 => 300,   // Second retry after 5 minutes
        3 => 900,   // Third retry after 15 minutes
    ];
}
```

## Email Processing

### Architecture
```
Email Request → Email Queue → Worker → Mailer → Recipient
                     │
                     ├── Success → Log → Complete
                     │
                     └── Failure → Retry → Failed Queue
```

### Components

#### 1. SendEmailJob
- Generic email job supporting multiple templates
- Configurable retry strategy
- Detailed logging

#### 2. Mail Classes
- TaskReminderMail (task reminders)
- Generic HTML/Markdown emails
- Transactional emails (password reset, verify email)

#### 3. Email Queue Configuration
```php
// queue.php
'emails' => [
    'driver' => 'redis',
    'queue' => 'emails',
    'retry_after' => 120,
    'max_attempts' => 5,
],
```

## Scheduled Notifications

### Notification Scheduling Flow
```
Task Created → NotificationRule Created → Scheduler Checks
                                              │
                                              ▼
                                    Rule Due → Dispatch Job
                                              │
                                              ▼
                                    Send Notification
                                              │
                                              ▼
                                    Update Log → Complete
```

### NotificationService Methods
```php
// Dispatch due notifications
$dispatched = $service->dispatchDueNotifications();

// Create notification rule
$rule = $service->createNotificationRule([
    'user_id' => 1,
    'task_id' => 10,
    'channel' => 'email',
    'reminder_offset' => 30,
    'reminder_unit' => 'minutes',
]);

// Cancel task notifications
$service->cancelTaskNotifications($taskId);
```

### Scheduler Configuration (Kernel.php)
```php
protected function schedule(Schedule $schedule): void
{
    // Process notifications every 5 minutes
    $schedule->command('notifications:process')
        ->everyFiveMinutes()
        ->withoutOverlapping()
        ->onOneServer();

    // Monitor queue health every minute
    $schedule->command('queue:monitor')
        ->everyMinute()
        ->runInBackground();
}
```

## Heavy Processing

### Heavy Processing Jobs
- Batch operations (import/export)
- Report generation
- Data transformations
- Image/video processing

### Queue Configuration
```php
'heavy' => [
    'driver' => 'redis',
    'queue' => 'heavy',
    'retry_after' => 600, // 10 minutes
    'max_attempts' => 2,
    'timeout' => 300, // 5 minutes max per job
],
```

### Best Practices
1. Chunk large datasets
2. Use progress tracking
3. Implement memory limits
4. Use batching for bulk operations

## Job Monitoring & Observability

### JobStatus Model
Tracks job lifecycle with:
- Unique job ID
- Job class and queue
- Current status
- Attempt count
- Progress percentage
- Error details
- Timing information

### Monitoring Commands
```bash
# Monitor queue health
php artisan queue:monitor

# Retry failed jobs
php artisan queue:retry failed

# Check failed jobs
php artisan queue:failed

# Clear failed jobs
php artisan queue:flush
```

### Logging
All job events logged to:
- Job start/completion
- Errors and exceptions
- Retries
- Performance metrics

### Alerts
- Failed job alerts (configurable threshold)
- Stuck job detection (> 1 hour)
- Queue backlog warnings

## Horizontal Scaling

### Worker Deployment
```bash
# Single server
php artisan queue:work redis --queue=default,emails,notifications

# Multiple workers (process management)
php artisan queue:work redis --queue=default --workers=4
```

### Load Distribution
- Redis Pub/Sub for job distribution
- Atomic locking prevents duplicate processing
- Connection pooling for efficiency

### Scaling Best Practices
1. Separate queues for different priority levels
2. Use supervisor for worker process management
3. Monitor queue length and processing time
4. Auto-scale workers based on queue depth

## Fault Tolerance & Reliability

### Data Persistence
- Jobs stored in Redis/database
- Failed jobs preserved for analysis
- Job status tracked in database

### Idempotent Design
- Unique job IDs prevent duplicates
- Fresh data fetching in handle method
- Idempotent operations (safe to retry)

### Graceful Degradation
- Circuit breaker pattern for external services
- Timeout protection
- Memory limits

## Configuration

### Environment Variables
```env
QUEUE_CONNECTION=redis
REDIS_QUEUE=default

# Queue-specific settings
QUEUE_RETRY_AFTER=90
QUEUE_MAX_ATTEMPTS=3
QUEUE_TIMEOUT=60

# Failed jobs
QUEUE_FAILED_DRIVER=database-uuids
```

### Queue Configuration (config/queue.php)
```php
return [
    'default' => env('QUEUE_CONNECTION', 'redis'),
    
    'connections' => [
        'redis' => [
            'driver' => 'redis',
            'connection' => 'queue',
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => 90,
            'block_for' => null,
        ],
    ],
    
    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'sqlite'),
        'table' => 'failed_jobs',
    ],
];
```

## Performance Considerations

### Optimization Tips
1. **Batch Processing**: Process multiple items together
2. **Lazy Loading**: Load only necessary data
3. **Connection Reuse**: Reuse database connections
4. **Caching**: Cache frequently accessed data

### Resource Management
- Memory limit: 256MB per job
- Timeout: Configurable per job type
- Concurrent workers: Based on server capacity

## Security

### Job Security
- Queue authentication
- Payload validation
- Input sanitization
- Rate limiting

### Data Protection
- Sensitive data encryption
- PII handling compliance
- Audit logging

## Troubleshooting

### Common Issues

#### Jobs Not Processing
1. Check Redis connection
2. Verify queue configuration
3. Check worker status

#### Duplicate Jobs
1. Review unique job IDs
2. Check idempotency implementation

#### Memory Issues
1. Chunk large datasets
2. Clear cached data
3. Increase memory limit

### Debug Commands
```bash
# List queued jobs
php artisan queue:work --once --verbose

# Check failed jobs
php artisan queue:failed

# Retry specific job
php artisan queue:retry {id}

# Monitor in real-time
php artisan queue:monitor --verbose
```

## Future Enhancements

1. **Priority Queues**: Implement job priorities
2. **Scheduling UI**: Web interface for scheduling
3. **Analytics Dashboard**: Real-time metrics
4. **A/B Testing**: Job performance comparison
5. **ML-based Retry**: Intelligent retry timing
6. **Distributed Locks**: Prevent concurrent execution
7. **Webhook Notifications**: External system integration

## Conclusion

This Scheduler & Queue module provides a robust, scalable foundation for background job processing. The architecture ensures reliability, maintainability, and performance for all background operations in the system.
