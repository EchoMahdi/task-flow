<?php

namespace Tests\Feature;

use App\Events\EventBus;
use App\Events\Contracts\TaskCreatedContract;
use App\Events\Contracts\TeamCreatedContract;
use App\Jobs\ProcessEventJob;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class EventBusTest extends TestCase
{
    use RefreshDatabase;

    protected EventBus $eventBus;

    protected function setUp(): void
    {
        parent::setUp();
        $this->eventBus = app(EventBus::class);
    }

    /** @test */
    public function it_can_emit_and_subscribe_to_events()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('test.event', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $payload = ['message' => 'Hello World', 'timestamp' => time()];
        $this->eventBus->emit('test.event', $payload);

        $this->assertEquals($payload, $receivedPayload);
    }

    /** @test */
    public function it_can_emit_to_multiple_subscribers()
    {
        $callCount = 0;
        
        $this->eventBus->subscribe('test.multi', function () use (&$callCount) {
            $callCount++;
        });
        
        $this->eventBus->subscribe('test.multi', function () use (&$callCount) {
            $callCount++;
        });

        $this->eventBus->emit('test.multi', []);

        $this->assertEquals(2, $callCount);
    }

    /** @test */
    public function it_validates_payload_with_contract()
    {
        config(['events.contracts.tasks.created' => TaskCreatedContract::class]);

        $payload = [
            'taskId' => '123',
            'title' => 'Test Task',
            'description' => 'Test Description',
        ];

        // Should not throw when payload is valid
        $this->eventBus->emit('tasks.created', $payload);
        
        $this->assertTrue(true);
    }

    /** @test */
    public function it_stores_events_in_replay_buffer()
    {
        config(['events.replay_buffer_size' => 5]);

        $eventBus = new EventBus();
        
        for ($i = 0; $i < 3; $i++) {
            $eventBus->emit('test.replay', ['index' => $i]);
        }

        $received = [];
        $eventBus->subscribe('test.replay', function ($payload) use (&$received) {
            $received[] = $payload;
        });

        // Late subscriber should receive buffered events
        $this->assertCount(3, $received);
    }

    /** @test */
    public function it_handles_unsubscribe()
    {
        $callCount = 0;
        
        $callback = function () use (&$callCount) {
            $callCount++;
        };
        
        $subscription = $this->eventBus->subscribe('test.unsub', $callback);
        $this->eventBus->emit('test.unsub', []);
        
        $this->eventBus->unsubscribe('test.unsub', $subscription);
        $this->eventBus->emit('test.unsub', []);

        $this->assertEquals(1, $callCount);
    }

    /** @test */
    public function it_transforms_payload_with_contract()
    {
        config(['events.contracts.teams.created' => TeamCreatedContract::class]);

        $payload = [
            'teamId' => 456,
            'name' => 'Test Team',
            'ownerId' => 789,
        ];

        $receivedPayload = null;
        $this->eventBus->subscribe('teams.created', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $this->eventBus->emit('teams.created', $payload);

        // Contract should transform IDs to strings
        $this->assertIsString($receivedPayload['teamId']);
        $this->assertEquals('456', $receivedPayload['teamId']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_continues_on_handler_error()
    {
        config(['events.handle_errors' => true]);

        $callCount = 0;
        
        $this->eventBus->subscribe('test.error', function () use (&$callCount) {
            $callCount++;
            throw new \Exception('Handler error');
        });
        
        $this->eventBus->subscribe('test.error', function () use (&$callCount) {
            $callCount++;
        });

        // Should not throw, just log error
        $this->eventBus->emit('test.error', []);

        $this->assertEquals(2, $callCount);
    }

    /** @test */
    public function it_dispatches_async_events_to_queue()
    {
        Queue::fake();

        $payload = ['test' => 'data', 'timestamp' => time()];
        $this->eventBus->emitAsync('test.async', $payload);

        // Verify job was dispatched
        Queue::assertPushed(ProcessEventJob::class, function ($job) {
            return $job->eventName === 'test.async';
        });
    }

    /** @test */
    public function it_can_disable_async_processing()
    {
        // Create EventBus with async disabled
        $syncEventBus = new EventBus(['async' => false]);
        
        $receivedPayload = null;
        $syncEventBus->subscribe('test.sync', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $payload = ['test' => 'sync_data'];
        $syncEventBus->emitAsync('test.sync', $payload);

        // Should be processed immediately when async is disabled
        $this->assertEquals($payload, $receivedPayload);
    }

    /** @test */
    public function it_stores_replay_buffer_before_async_dispatch()
    {
        config(['events.replay_buffer_size' => 5]);
        $eventBus = new EventBus(['async' => false]);
        
        // Emit async with replay enabled
        $eventBus->emitAsync('test.replay.async', ['index' => 1]);
        $eventBus->emitAsync('test.replay.async', ['index' => 2]);

        $received = [];
        $eventBus->subscribe('test.replay.async', function ($payload) use (&$received) {
            $received[] = $payload;
        }, ['replay' => true]);

        // Late subscriber should receive buffered events
        $this->assertCount(2, $received);
    }
}
