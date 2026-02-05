# Notification Module - Complete Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Components](#frontend-components)
6. [Email Templates](#email-templates)
7. [Scheduling & Automation](#scheduling--automation)
8. [Extension Guide](#extension-guide)
9. [Security Considerations](#security-considerations)
10. [Testing](#testing)

---

## Overview

The Notification Module is a comprehensive, configurable, and extensible notification system designed for the Laravel To-Do List application. It provides timely user alerts for upcoming task deadlines through multiple channels, with a focus on reliability, user experience, and maintainability.

### Key Features
- **Task-Based Notifications**: Configurable per task with individual enable/disable controls
- **Multiple Reminder Times**: Support for multiple reminder notifications per task
- **Multiple Channels**: Email support with extensibility for SMS, push, and in-app notifications
- **Global Settings**: User-level notification preferences and defaults
- **Timezone Awareness**: Respects user's timezone for notification scheduling
- **Scheduler-Based**: Reliable, non-blocking notification delivery using Laravel's queue system
- **Delivery Tracking**: Complete logging of notification status (sent, pending, failed)

---

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Notification Module                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    Task     │───>│ Notification│───>│  Scheduler  │         │
│  │   Service   │    │   Service   │    │   (Kernel)  │         │
│  └─────────────┘    └─────────────┘    └──────┬──────┘         │
│         │                                        │                │
│         │                                        │                │
│         ▼                                        ▼                │
│  ┌─────────────┐                       ┌─────────────┐          │
│  │  Frontend   │                       │     CLI     │          │
│  │  Components │                       │  Commands   │          │
│  └─────────────┘                       └─────────────┘          │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      Notification Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Notification│───>│  Process    │───>│  Channel     │         │
│  │    Queue    │    │  Notification│    │  Handlers   │         │
│  └─────────────┘    │    (Job)     │    └──────┬──────┘         │
│                     └─────────────┘           │                 │
│                                                ▼                 │
│                                        ┌─────────────────┐      │
│                                        │   Email Channel │      │
│                                        │   SMS Channel   │      │
│                                        │   Push Channel  │      │
│                                        │   In-App Channel│      │
│                                        └─────────────────┘      │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                      Data Layer                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐  │
│  │ notification_    │    │ notification_   │    │ user_       │  │
│  │     rules       │    │     logs        │    │ notification│  │
│  │                 │    │                 │    │ _settings   │  │
│  └─────────────────┘    └─────────────────┘    └─────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Description

#### 1. **Models** (`app/Models/`)
- **`NotificationRule`**: Defines notification rules per task (reminder time, channel, enabled status)
- **`NotificationLog`**: Tracks delivery status (sent, pending, failed)
- **`UserNotificationSetting`**: Stores user-level preferences and defaults

#### 2. **Services** (`app/Services/`)
- **`NotificationService`**: Core business logic for notification management
  - CRUD operations for notification rules
  - User settings management
  - Notification dispatching
  - History and logging

#### 3. **Jobs** (`app/Jobs/`)
- **`ProcessNotification`**: Queued job for processing and sending notifications
  - Supports multiple channels
  - Duplicate prevention
  - Error handling and logging
  - Automatic retry

#### 4. **Mail** (`app/Mail/`)
- **`TaskReminderMail`**: Mailable for email notifications
  - Markdown templates
  - Subject line generation
  - Attachments support

#### 5. **Console** (`app/Console/`)
- **`Kernel.php`**: Scheduler configuration
- **`ProcessNotificationReminders`**: CLI command for manual triggering

#### 6. **Controllers** (`app/Http/Controllers/Api/`)
- **`NotificationController`**: REST API endpoints for notification management

#### 7. **Resources** (`app/Http/Resources/`)
- **`NotificationRuleResource`**: JSON transformation for notification rules
- **`NotificationLogResource`**: JSON transformation for notification logs
- **`UserNotificationSettingResource`**: JSON transformation for user settings

---

## Database Schema

### Tables

#### 1. `notification_rules`
Stores per-task notification configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users table |
| `task_id` | bigint | Foreign key to tasks table |
| `channel` | string | Notification channel (email, sms, push, in_app) |
| `reminder_offset` | int | Time before due date |
| `reminder_unit` | string | Unit for offset (minutes, hours, days) |
| `is_enabled` | boolean | Whether this rule is active |
| `last_sent_at` | timestamp | When the last notification was sent |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

**Indexes:**
- `(user_id, task_id)` - Fast lookups for user's task notifications
- `(channel, is_enabled)` - Filter by active rules per channel

#### 2. `notification_logs`
Tracks notification delivery status.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `notification_rule_id` | bigint | Foreign key to notification_rules |
| `user_id` | bigint | Foreign key to users table |
| `task_id` | bigint | Foreign key to tasks table |
| `channel` | string | Channel used for delivery |
| `status` | string | Status (pending, sent, failed) |
| `sent_at` | timestamp | When the notification was sent |
| `error_message` | text | Error details if failed |
| `metadata` | json | Additional context data |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

**Indexes:**
- `(user_id, status)` - Filter notifications by status
- `(notification_rule_id, status)` - Check rule delivery status
- `(created_at)` - Time-based queries

#### 3. `user_notification_settings`
Stores user-level notification preferences.

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `user_id` | bigint | Foreign key to users table |
| `email_notifications_enabled` | boolean | Global email toggle |
| `in_app_notifications_enabled` | boolean | Global in-app toggle |
| `timezone` | string | User's timezone (default: UTC) |
| `default_reminder_offset` | int | Default reminder time |
| `default_reminder_unit` | string | Default unit (minutes, hours, days) |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Update timestamp |

**Indexes:**
- `user_id` (UNIQUE) - One record per user

### Relationships

```
User
├── hasMany NotificationRules
├── hasMany NotificationLogs
└── hasOne UserNotificationSettings

Task
├── hasMany NotificationRules
└── hasMany NotificationLogs

NotificationRule
├── belongsTo User
├── belongsTo Task
└── hasMany NotificationLogs
```

---

## Backend Implementation

### NotificationService

The core service handling all notification business logic.

```php
// Get notification rules for a task
$rules = $notificationService->getTaskNotificationRules($taskId, $userId);

// Create a new notification rule
$rule = $notificationService->createNotificationRule([
    'user_id' => $userId,
    'task_id' => $taskId,
    'channel' => 'email',
    'reminder_offset' => 30,
    'reminder_unit' => 'minutes',
    'is_enabled' => true,
]);

// Update notification rule
$rule = $notificationService->updateNotificationRule($ruleId, [
    'reminder_offset' => 60,
    'is_enabled' => true,
]);

// Toggle notification rule
$rule = $notificationService->toggleNotificationRule($ruleId);

// Get user settings
$settings = $notificationService->getUserSettings($userId);

// Update user settings
$settings = $notificationService->updateUserSettings($userId, [
    'email_notifications_enabled' => true,
    'timezone' => 'America/New_York',
    'default_reminder_offset' => 60,
]);

// Dispatch due notifications
$dispatched = $notificationService->dispatchDueNotifications();

// Get notification history
$logs = $notificationService->getUserNotificationLogs($userId, 50);
```

### ProcessNotification Job

Handles the actual notification delivery with reliability features.

**Key Features:**
- **Unique Jobs**: Prevents duplicate processing using unique ID
- **Timeout**: 60-second execution limit
- **Max Exceptions**: 3 retry attempts
- **Error Handling**: Automatic retry on failure
- **Logging**: Comprehensive error and success logging

```php
// Job structure
class ProcessNotification implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    protected NotificationRule $rule;
    
    public function uniqueId(): string
    {
        // Ensures each rule processing is unique
        return "notification-{$this->rule->id}";
    }
    
    public function handle(): void
    {
        // Verify rule is still enabled
        // Check for duplicates
        // Create notification log
        // Send via appropriate channel
        // Update rule's last_sent_at
    }
}
```

### Scheduler Configuration

The scheduler runs every 5 minutes to check and dispatch due notifications.

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    $schedule->command('notifications:process')
        ->everyFiveMinutes()
        ->withoutOverlapping()
        ->runInBackground()
        ->onOneServer();
}
```

**Why every 5 minutes?**
- Balances timeliness with server load
- Ensures notifications are sent within 5 minutes of due time
- Prevents excessive database queries

### API Endpoints

#### Task Notifications
```
GET    /api/tasks/{task}/notifications
POST   /api/tasks/{task}/notifications
PUT    /api/notifications/{rule}
DELETE /api/notifications/{rule}
POST   /api/notifications/{rule}/toggle
```

#### User Settings
```
GET  /api/notifications/settings
PUT  /api/notifications/settings
```

#### History
```
GET  /api/notifications/history?limit=50
```

---

## Frontend Components

### NotificationSettings (Task-Level)

A modal component for configuring notifications on individual tasks.

**Features:**
- Toggle email notifications on/off
- Select reminder time (1-99 minutes/hours/days)
- Real-time preview of when notifications will be sent
- Loading and error states

```jsx
import NotificationSettings from './components/notifications/NotificationSettings';

// Usage in a task detail page
<NotificationSettings 
    taskId={task.id}
    onClose={() => setShowSettings(false)}
/>
```

### UserNotificationSettings (Global)

Comprehensive settings page for user's notification preferences.

**Features:**
- Email notification toggle
- In-app notification toggle
- Default reminder time
- Timezone selection
- Per-setting explanations

```jsx
import UserNotificationSettings from './components/notifications/UserNotificationSettings';

// Usage in settings page
<UserNotificationSettings />
```

### NotificationHistory

Displays the history of sent notifications with status tracking.

**Features:**
- Filter by status (sent, pending, failed)
- Show channel type (email, etc.)
- Error messages for failed notifications
- Direct links to related tasks
- Pagination via limit parameter

```jsx
import NotificationHistory from './components/notifications/NotificationHistory';

// Usage in history page
<NotificationHistory limit={50} />
```

### Styling

All components use a consistent design system:
- Clean, modern UI with rounded corners
- Clear visual hierarchy
- Accessible color contrast
- Responsive design for mobile
- Loading and error states
- Success feedback

---

## Email Templates

### Task Reminder Email

**File:** `resources/views/emails/task-reminder.blade.php`

**Features:**
- Clean, professional design
- Responsive layout
- Clear task details
- Prominent call-to-action button
- Urgency indicators based on due date
- Unsubscribe instructions

**Example Email:**

```
Subject: ⏰ Reminder: Task 'Complete project proposal' is due in 30 minutes

Hello John,

You have a task that's due soon!

[Complete project proposal]

Description: Finalize the Q1 project proposal document
Due Date: Friday, January 15, 2026 at 3:30 PM
Reminder: This task is due in 30 minutes.

[View Task]

⚠️ This task is due today! Please make sure to complete it.

Thanks for using our is an automated reminder Task Manager!

This from our Task Notification System.
If you no longer wish to receive these notifications, you can 
manage your notification settings in your account preferences.
```

---

## Scheduling & Automation

### How It Works

1. **Task Creation**: When a task with a due date is created, a default notification rule is added based on user's default settings.

2. **Scheduler Runs**: Every 5 minutes, the scheduler executes `notifications:process`.

3. **Rule Evaluation**: The command queries for notification rules where:
   - `is_enabled = true`
   - `last_sent_at` is null OR older than 1 hour
   - No successful notification was sent in the last hour
   - The reminder time has passed

4. **Job Dispatch**: Each due rule dispatches a `ProcessNotification` job to the queue.

5. **Job Execution**: The job:
   - Verifies the rule is still valid
   - Checks user settings
   - Creates a notification log
   - Sends via appropriate channel
   - Updates the rule's `last_sent_at`

6. **Email Delivery**: The email is queued and sent via Laravel's mail system.

### Manual Commands

```bash
# Process pending notifications
php artisan notifications:process

# Dry run (no actual sending)
php artisan notifications:process --dry-run
```

### Queue Configuration

```php
// config/queue.php
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => 'default',
    'retry_after' => 90,
    'block_for' => null,
],
```

---

## Extension Guide

### Adding a New Channel (e.g., SMS)

1. **Create the Channel Class**

```php
// app/Channels/SmsChannel.php
namespace App\Channels;

use App\Models\NotificationRule;
use App\Models\Task;
use App\Models\User;

class SmsChannel
{
    public function send(User $user, Task $task, NotificationRule $rule): bool
    {
        // Implement SMS sending logic
        // Use services like Twilio, Nexmo, etc.
        return true; // or throw exception on failure
    }
}
```

2. **Update the ProcessNotification Job**

```php
// app/Jobs/ProcessNotification.php
use App\Channels\SmsChannel;

protected function sendSmsNotification(User $user, Task $task, NotificationRule $rule, NotificationLog $log): void
{
    $sms = new SmsChannel();
    try {
        $sms->send($user, $task, $rule);
        $log->markAsSent();
    } catch (\Exception $e) {
        $log->markAsFailed($e->getMessage());
        throw $e;
    }
}
```

3. **Update the NotificationRule Model**

```php
// app/Models/NotificationRule.php
public const CHANNEL_SMS = 'sms';

// In getChannels() method, add:
self::CHANNEL_SMS => 'SMS',
```

4. **Update Frontend**

```jsx
// Add SMS option to channel selector
<select value={channel} onChange={handleChannelChange}>
    <option value="email">Email</option>
    <option value="sms">SMS</option>
</select>
```

5. **Create Database Migration** (if needed)
   - No schema changes needed if using generic `channel` column

### Adding Custom Reminder Intervals

1. **Update NotificationRule Model**

```php
// app/Models/NotificationRule.php
public const UNIT_WEEKS = 'weeks';

public static function getReminderUnits(): array
{
    return [
        self::UNIT_MINUTES => 'Minutes',
        self::UNIT_HOURS => 'Hours',
        self::UNIT_DAYS => 'Days',
        self::UNIT_WEEKS => 'Weeks', // Add this
    ];
}
```

2. **Update Mailable**

```php
// app/Mail/TaskReminderMail.php
protected function getReminderText(): string
{
    $offset = $this->rule->reminder_offset;
    $unit = $this->rule->reminder_unit;
    
    $unitLabel = match ($unit) {
        'weeks' => 'week' . ($offset > 1 ? 's' : ''),
        // ... existing code
    };
}
```

### Adding Notification Events

Fire events when notifications are sent:

```php
// app/Events/NotificationSent.php
namespace App\Events;

use App\Models\NotificationLog;
use Illuminate\Foundation\Events\Dispatchable;

class NotificationSent
{
    use Dispatchable;
    
    public NotificationLog $log;
    
    public function __construct(NotificationLog $log)
    {
        $this->log = $log;
    }
}
```

```php
// In ProcessNotification job
use App\Events\NotificationSent;

$log->markAsSent();
event(new NotificationSent($log));
```

---

## Security Considerations

### 1. Authentication & Authorization

All API endpoints require authentication via Sanctum:

```php
Route::middleware(['auth:sanctum'])->group(function () {
    // Protected routes
});
```

### 2. Data Validation

Strict validation on all inputs:

```php
$request->validate([
    'reminder_offset' => 'required|integer|min:1',
    'reminder_unit' => 'required|string|in:minutes,hours,days',
    'channel' => 'sometimes|string|in:email,sms,push,in_app',
]);
```

### 3. Access Control

Users can only manage their own notifications:

```php
// In controller
public function updateNotification(Request $request, int $ruleId)
{
    $rule = NotificationRule::findOrFail($ruleId);
    
    // Ensure user owns this rule
    if ($rule->user_id !== Auth::id()) {
        abort(403, 'Unauthorized');
    }
    // ...
}
```

### 4. Email Security

- Validate email addresses before sending
- Use proper DKIM/SPF configuration in production
- Implement rate limiting for notification sending
- Never include sensitive data in notification logs

### 5. Queue Security

- Use unique job IDs to prevent duplicate processing
- Implement proper exception handling
- Set reasonable timeouts and retry limits
- Monitor queue performance

---

## Testing

### Unit Tests

```php
// tests/Unit/NotificationServiceTest.php
namespace Tests\Unit;

use App\Models\NotificationRule;
use App\Models\User;
use App\Models\Task;
use App\Services\NotificationService;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    protected NotificationService $service;
    
    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new NotificationService();
    }
    
    public function test_create_notification_rule()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);
        
        $rule = $this->service->createNotificationRule([
            'user_id' => $user->id,
            'task_id' => $task->id,
            'channel' => 'email',
            'reminder_offset' => 30,
            'reminder_unit' => 'minutes',
            'is_enabled' => true,
        ]);
        
        $this->assertNotNull($rule->id);
        $this->assertEquals(30, $rule->reminder_offset);
        $this->assertTrue($rule->is_enabled);
    }
    
    public function test_get_reminder_datetime()
    {
        $rule = NotificationRule::factory()->create([
            'reminder_offset' => 30,
            'reminder_unit' => 'minutes',
        ]);
        
        $reminderDateTime = $rule->reminder_date_time;
        
        $this->assertInstanceOf(\Carbon\Carbon::class, $reminderDateTime);
        $this->assertTrue($reminderDateTime->isPast());
    }
}
```

### Feature Tests

```php
// tests/Feature/NotificationApiTest.php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_can_get_task_notifications()
    {
        $user = User::factory()->create();
        $task = $user->tasks()->create([
            'title' => 'Test Task',
            'due_date' => now()->addDay(),
        ]);
        
        $response = $this->actingAs($user)
            ->getJson("/api/tasks/{$task->id}/notifications");
        
        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'task_id',
                        'channel',
                        'reminder_offset',
                        'reminder_unit',
                        'is_enabled',
                    ]
                ]
            ]);
    }
    
    public function test_can_create_notification_rule()
    {
        $user = User::factory()->create();
        $task = $user->tasks()->create([
            'title' => 'Test Task',
            'due_date' => now()->addDay(),
        ]);
        
        $response = $this->actingAs($user)
            ->postJson("/api/tasks/{$task->id}/notifications", [
                'reminder_offset' => 60,
                'reminder_unit' => 'minutes',
                'channel' => 'email',
            ]);
        
        $response->assertCreated()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'reminder_offset',
                    'reminder_unit',
                ]
            ]);
    }
}
```

### Integration Test

```php
// tests/Integration/NotificationPipelineTest.php
namespace Tests\Integration;

use App\Jobs\ProcessNotification;
use App\Models\NotificationRule;
use App\Models\Task;
use App\Models\User;
use App\Models\UserNotificationSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class NotificationPipelineTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_notification_pipeline()
    {
        Queue::fake();
        
        // Create user with notifications enabled
        $user = User::factory()->create();
        UserNotificationSetting::factory()->create([
            'user_id' => $user->id,
            'email_notifications_enabled' => true,
        ]);
        
        // Create task with due date in the past (to trigger notification)
        $task = $user->tasks()->create([
            'title' => 'Urgent Task',
            'due_date' => now()->subMinutes(30),
        ]);
        
        // Create notification rule
        $rule = NotificationRule::factory()->create([
            'user_id' => $user->id,
            'task_id' => $task->id,
            'reminder_offset' => 30,
            'reminder_unit' => 'minutes',
            'is_enabled' => true,
        ]);
        
        // Dispatch notifications
        $service = app(\App\Services\NotificationService::class);
        $dispatched = $service->dispatchDueNotifications();
        
        // Assert job was dispatched
        Queue::assertPushed(ProcessNotification::class, function ($job) use ($rule) {
            return $job->rule->id === $rule->id;
        });
    }
}
```

---

## Performance Considerations

### Database Optimization

- Use indexes on frequently queried columns
- Schedule heavy queries during off-peak hours
- Implement pagination for notification history
- Use cursor-based pagination for large datasets

### Queue Optimization

- Use Redis for fast queue processing
- Configure appropriate retry attempts
- Implement job batching for bulk operations
- Monitor queue length and processing time

### Caching

- Cache user notification settings
- Cache frequently accessed notification rules
- Use request-level caching for read operations

---

## Deployment Checklist

- [ ] Run database migrations
- [ ] Configure mail settings in `.env`
- [ ] Set up Redis connection for queues
- [ ] Configure Laravel Scheduler in crontab
- [ ] Set up queue worker process
- [ ] Configure monitoring for failed jobs
- [ ] Test notification delivery
- [ ] Set up email delivery tracking
- [ ] Configure rate limiting

---

## Troubleshooting

### Common Issues

1. **Notifications not being sent**
   - Check if scheduler is running
   - Verify queue worker is active
   - Check notification rules are enabled
   - Verify user email settings are enabled

2. **Duplicate notifications**
   - Check `last_sent_at` timestamp
   - Verify notification logs for duplicates
   - Check queue job uniqueness

3. **Email not delivering**
   - Check mail configuration
   - Verify email address validity
   - Check spam folder
   - Review mail logs

### Logging

All notification operations are logged to `storage/logs/laravel.log`:

```bash
# View notification logs
tail -f storage/logs/laravel.log | grep notification
```

### Monitoring

Set up alerts for:
- Failed notification jobs
- Queue backup
- Email delivery failures

---

## Conclusion

This notification module provides a robust, scalable foundation for sending task reminders through multiple channels. Its modular architecture makes it easy to extend and customize for specific needs while maintaining reliability and performance.

For questions or support, please refer to the project documentation or create an issue in the repository.
