<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Password Changed Successfully')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your password has been changed successfully.')
            ->line('If you did not make this change, please contact us immediately.')
            ->action('Go to Dashboard', route('dashboard'))
            ->line('For your security, all other sessions have been logged out.')
            ->salutation('Regards, ' . config('app.name'));
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'message' => 'Your password was changed successfully',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
