<?php

namespace Tests\Feature;

use App\Models\Team;
use App\Models\User;
use App\Services\TeamService;
use App\Events\EventBus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamEventTest extends TestCase
{
    use RefreshDatabase;

    protected TeamService $teamService;
    protected EventBus $eventBus;

    protected function setUp(): void
    {
        parent::setUp();
        $this->eventBus = app(EventBus::class);
        $this->teamService = app(TeamService::class);
    }

    /** @test */
    public function it_emits_team_created_event()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('teams.created', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $owner = User::factory()->create();
        
        $team = $this->teamService->createTeam($owner, [
            'name' => 'Test Team',
            'description' => 'Test Description',
        ]);

        $this->assertNotNull($receivedPayload);
        $this->assertEquals((string) $team->id, $receivedPayload['teamId']);
        $this->assertEquals('Test Team', $receivedPayload['name']);
        $this->assertEquals((string) $owner->id, $receivedPayload['ownerId']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_emits_team_updated_event()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('teams.updated', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $team = Team::factory()->create();
        
        $updatedTeam = $this->teamService->updateTeam($team, [
            'name' => 'Updated Team Name',
        ]);

        $this->assertNotNull($receivedPayload);
        $this->assertEquals((string) $team->id, $receivedPayload['teamId']);
        $this->assertEquals('Updated Team Name', $receivedPayload['name']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_emits_team_deleted_event()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('teams.deleted', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $team = Team::factory()->create();
        $teamId = $team->id;
        
        $this->teamService->deleteTeam($team);

        $this->assertNotNull($receivedPayload);
        $this->assertEquals((string) $teamId, $receivedPayload['teamId']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_emits_member_added_event()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('teams.member.added', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $team = Team::factory()->create();
        $member = User::factory()->create();
        
        $this->teamService->addMember($team, $member, 'member');

        $this->assertNotNull($receivedPayload);
        $this->assertEquals((string) $team->id, $receivedPayload['teamId']);
        $this->assertEquals((string) $member->id, $receivedPayload['userId']);
        $this->assertEquals('member', $receivedPayload['role']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_emits_member_removed_event()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('teams.member.removed', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $team = Team::factory()->create();
        $member = User::factory()->create();
        $team->addMember($member, 'member');
        
        $this->teamService->removeMember($team, $member);

        $this->assertNotNull($receivedPayload);
        $this->assertEquals((string) $team->id, $receivedPayload['teamId']);
        $this->assertEquals((string) $member->id, $receivedPayload['userId']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_emits_role_changed_event()
    {
        $receivedPayload = null;
        
        $this->eventBus->subscribe('teams.role.changed', function ($payload) use (&$receivedPayload) {
            $receivedPayload = $payload;
        });

        $team = Team::factory()->create();
        $member = User::factory()->create();
        $team->addMember($member, 'member');
        
        $this->teamService->updateMemberRole($team, $member, 'admin');

        $this->assertNotNull($receivedPayload);
        $this->assertEquals((string) $team->id, $receivedPayload['teamId']);
        $this->assertEquals((string) $member->id, $receivedPayload['userId']);
        $this->assertEquals('admin', $receivedPayload['newRole']);
        $this->assertEquals('member', $receivedPayload['oldRole']);
        $this->assertEquals('backend', $receivedPayload['source']);
    }

    /** @test */
    public function it_cannot_remove_team_owner()
    {
        $team = Team::factory()->create();
        
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Cannot remove the team owner.');
        
        $this->teamService->removeMember($team, $team->owner);
    }
}
