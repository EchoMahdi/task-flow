<?php

namespace App\Jobs;

use App\Mail\TaskReminderMail;
use App\Models\NotificationLog;
use App\Models\NotificationRule;
use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProcessNotification implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The notification rule instance.
     */
    protected NotificationRule $rule;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 60;

    /**
     * The number of times the job may be attempted.
     */
    public $maxExceptions = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(NotificationRule $rule)
    {
        $this->rule = $rule->withoutRelations();
    }

    /**
     * Get the unique ID for this job.
     */
    public function uniqueId(): string
    {
        $timestamp = $this->rule->last_sent_at ? $this->rule->last_sent_at->timestamp : 'pending';
        return "notification-{$this->rule->id}-{$timestamp}";
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if rule is still enabled
        $rule = $this->rule->fresh();
        
        if (!$rule || !$rule->is_enabled) {
            Log::info("Notification rule {$rule->id} is disabled, skipping");
            return;
        }

        // Get the task
        $task = $rule->task;
        
        if (!$task) {
            Log::warning("Task not found for notification rule {$rule->id}");
            return;
        }

        // Get the user
        $user = $rule->user;
        
        if (!$user) {
            Log::warning("User not found for notification rule {$rule->id}");
            return;
        }

        // Check if already sent recently (prevent duplicates)
        $recentLog = NotificationLog::where('notification_rule_id', $rule->id)
            ->where('status', NotificationLog::STATUS_SENT)
            ->where('created_at', '>', now()->subHours(1))
            ->first();

        if ($recentLog) {
            Log::info("Notification already sent recently for rule {$rule->id}");
            return;
        }

        try {
            // Create notification log
            $log = NotificationLog::create([
                'notification_rule_id' => $rule->id,
                'user_id' => $user->id,
                'task_id' => $task->id,
                'channel' => $rule->channel,
                'status' => NotificationLog::STATUS_PENDING,
                'metadata' => [
                    'reminder_offset' => $rule->reminder_offset,
                    'reminder_unit' => $rule->reminder_unit,
                    'due_date' => $task->due_date,
                ],
            ]);

            // Send notification based on channel
            switch ($rule->channel) {
                case NotificationRule::CHANNEL_EMAIL:
                    $this->sendEmailNotification($user, $task, $rule, $log);
                    break;
                case NotificationRule::CHANNEL_IN_APP:
                    $this->sendInAppNotification($user, $task, $rule, $log);
                    break;
                // Add more channels here as needed
                default:
                    Log::warning("Unknown notification channel: {$rule->channel}");
                    $log->markAsFailed("Unknown channel: {$rule->channel}");
                    return;
            }

            // Update the rule's last_sent_at
            $rule->update(['last_sent_at' => now()]);

            Log::info("Successfully processed notification for task {$task->id}");

        } catch (\Exception $e) {
            Log::error("Failed to process notification: " . $e->getMessage());
            
            // Mark as failed
            if (isset($log)) {
                $log->markAsFailed($e->getMessage());
            }
            
            // Release the job back to the queue for retry
            $this->release(60);
        }
    }

    /**
     * Send email notification.
     */
    protected function sendEmailNotification(User $user, Task $task, NotificationRule $rule, NotificationLog $log): void
    {
        try {
            $mail = new TaskReminderMail($user, $task, $rule);
            Mail::to($user->email)->send($mail);
            
            $log->markAsSent();
            
            Log::info("Email notification sent to {$user->email} for task {$task->id}");
            
        } catch (\Exception $e) {
            $log->markAsFailed($e->getMessage());
            throw $e;
        }
    }

    /**
     * Send in-app notification (placeholder for future implementation).
     */
    protected function sendInAppNotification(User $user, Task $task, NotificationRule $rule, NotificationLog $log): void
    {
        // Implementation for in-app notifications would go here
        // This could use Laravel's broadcasting, database notifications, etc.
        
        $log->markAsSent();
        
        Log::info("In-app notification created for user {$user->id} for task {$task->id}");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Notification job failed: " . $exception->getMessage());
        
        // Could notify admins, update monitoring systems, etc.
    }
}
