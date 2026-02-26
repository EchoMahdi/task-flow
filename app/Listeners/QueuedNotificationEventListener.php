<?php

namespace  App\Listeners;

use App\Events\Notification\NotificationRead;
use App\Events\Notification\NotificationReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Queued Notification Event Listener
 * 
 * Handles notification-related events asynchronously via queue.
 * Implements ShouldQueue for background processing.
 * 
 * @package  App\Listeners
 */
class QueuedNotificationEventListener implements ShouldQueue
{
    /**
     * The name of the queue the job should be sent to.
     */
    public string $queue = 'notifications';

    /**
     * Handle notification received event
     *
     * @param NotificationReceived $event
     * @return void
     */
    public function handleNotificationReceived(NotificationReceived $event): void
    {
        Log::info('Notification received via queued event system', [
            'notificationId' => $event->notificationId,
            'userId' => $event->userId,
            'type' => $event->type,
        ]);

        // TODO: Implement additional handling such as:
        // - Push notification to user
        // - Update notification badge count
        // - Trigger real-time WebSocket event
    }

    /**
     * Handle the event.
     *
     * @param NotificationReceived $event
     * @return void
     */
    public function onNotificationReceived(NotificationReceived $event): void
    {
        $this->handleNotificationReceived($event);
    }

    /**
     * Handle notification read event
     *
     * @param NotificationRead $event
     * @return void
     */
    public function handleNotificationRead(NotificationRead $event): void
    {
        Log::info('Notification read via queued event system', [
            'notificationId' => $event->notificationId,
            'userId' => $event->userId,
            'readAt' => $event->readAt,
        ]);

        // TODO: Implement additional handling such as:
        // - Update read status in database
        // - Recalculate unread count
        // - Trigger UI update via WebSocket
    }

    /**
     * Handle the event.
     *
     * @param NotificationRead $event
     * @return void
     */
    public function onNotificationRead(NotificationRead $event): void
    {
        $this->handleNotificationRead($event);
    }

}
