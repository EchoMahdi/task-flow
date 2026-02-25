<?php

namespace Tests\Feature;

use App\Models\NotificationLog;
use App\Models\User;
use App\Services\NotificationService;
use App\Events\EventBus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationEventTest extends TestCase
{
    use RefreshDatabase;

    protected NotificationService $notificationService;
    protected EventBus $eventBus;

    protected function setUp(): void
    {
        parent::setUp();
        $this->eventBus = app(EventBus::class);
        $this->notificationService = app(NotificationService::class);
    }

    /** @test */
    public function it_emits_notification_read_event()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('notifications.read', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $user = User::factory()->create();
        
        $notification = NotificationLog::create([
            'user_id' => $user->id,
            'task_id' => null,
            'channel' => 'in_app',
            'status' => 'sent',
            'metadata' => [],
        ]);

        $result = $this->notificationService->markNotificationAsRead($notification->id, $user->id);

        $this->assertNotNull($receivedPayload);
        $this->assertEquals((string) $notification->id, $receivedPayload['notificationId']);
        $this->assertEquals((string) $user->id, $receivedPayload['userId']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_emits_bulk_notification_read_event()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('notifications.read', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $user = User::factory()->create();
        
        // Create multiple unread notifications
        NotificationLog::create([
            'user_id' => $user->id,
            'task_id' => null,
            'channel' => 'in_app',
            'status' => 'sent',
            'metadata' => [],
        ]);
        
        NotificationLog::create([
            'user_id' => $user->id,
            'task_id' => null,
            'channel' => 'in_app',
            'status' => 'sent',
            'metadata' => [],
        ]);

        $count = $this->notificationService->markAllNotificationsAsRead($user->id);

        $this->assertEquals(2, $count);
        $this->assertNotNull($receivedPayload);
        $this->assertEquals('all', $receivedPayload['notificationId']);
        $this->assertEquals((string) $user->id, $receivedPayload['userId']);
        $this->assertEquals(2, $receivedPayload['count']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_does_not_emit_event_when_no_notifications_marked_as_read()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('notifications.read', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $user = User::factory()->create();
        
        // No unread notifications
        $count = $this->notificationService->markAllNotificationsAsRead($user->id);

        $this->assertEquals(0, $count);
        $this->assertNull($receivedPayload);
    }

    /** @test */
    public function it_validates_payload_structure_for_notification_events()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('notifications.read', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $user = User::factory()->create();
        
        $notification = NotificationLog::create([
            'user_id' => $user->id,
            'task_id' => null,
            'channel' => 'in_app',
            'status' => 'sent',
            'metadata' => [],
        ]);

        $this->notificationService->markNotificationAsRead($notification->id, $user->id);

        // Verify all required fields are present
        $this->assertArrayHasKey('notificationId', $receivedPayload);
        $this->assertArrayHasKey('userId', $receivedPayload);
        $this->assertArrayHasKey('readAt', $receivedPayload);
        $this->assertArrayHasKey('source', $receivedPayload);
        
        // Verify types
        $this->assertIsString($receivedPayload['notificationId']);
        $this->assertIsString($receivedPayload['userId']);
        $this->assertIsNumeric($receivedPayload['readAt']);
        $this->assertIsString($receivedPayload['source']);
    }
}
