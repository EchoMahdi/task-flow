<?php

namespace App\Mail;

use App\Models\NotificationRule;
use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The user instance.
     */
    protected User $user;

    /**
     * The task instance.
     */
    protected Task $task;

    /**
     * The notification rule instance.
     */
    protected NotificationRule $rule;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, Task $task, NotificationRule $rule)
    {
        $this->user = $user;
        $this->task = $task;
        $this->rule = $rule;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $reminderText = $this->getReminderText();
        
        return new Envelope(
            subject: "⏰ Reminder: Task '{$this->task->title}' is due {$reminderText}",
            from: new Address(
                config('mail.from.address', 'noreply@example.com'),
                config('mail.from.name', 'Task Reminder')
            ),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.task-reminder',
            with: [
                'userName' => $this->user->name,
                'taskTitle' => $this->task->title,
                'taskDescription' => $this->task->description,
                'dueDate' => $this->task->due_date,
                'reminderText' => $this->getReminderText(),
                'taskUrl' => $this->getTaskUrl(),
                'daysUntilDue' => $this->getDaysUntilDue(),
            ],
        );
    }

    /**
     * Get human-readable reminder text.
     */
    protected function getReminderText(): string
    {
        $offset = $this->rule->reminder_offset;
        $unit = $this->rule->reminder_unit;
        
        return match ($unit) {
            'hours' => "in {$offset} hour" . ($offset > 1 ? 's' : ''),
            'days' => "in {$offset} day" . ($offset > 1 ? 's' : ''),
            default => "in {$offset} minute" . ($offset > 1 ? 's' : ''),
        };
    }

    /**
     * Get days until due date.
     */
    protected function getDaysUntilDue(): int
    {
        if (!$this->task->due_date) {
            return 0;
        }
        
        return now()->diffInDays(\Carbon\Carbon::parse($this->task->due_date));
    }

    /**
     * Get the task URL.
     */
    protected function getTaskUrl(): string
    {
        return config('app.url') . "/tasks/{$this->task->id}";
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
