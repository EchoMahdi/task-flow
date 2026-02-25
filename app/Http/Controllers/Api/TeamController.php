<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use App\Models\User;
use App\Services\TeamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Team Controller
 * 
 * Handles API endpoints for team management.
 */
class TeamController extends Controller
{
    protected TeamService $teamService;

    public function __construct(TeamService $teamService)
    {
        $this->teamService = $teamService;
    }

    /**
     * Get all teams the user is a member of.
     * GET /api/teams
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $teams = $this->teamService->getAccessibleTeams($request->user());
        return TeamResource::collection($teams);
    }

    /**
     * Create a new team.
     * POST /api/teams
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'avatar'      => 'nullable|string|max:255',
        ]);

        $team = $this->teamService->createTeam($request->user(), $validated);

        return (new TeamResource($team))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Get a single team.
     * GET /api/teams/{team}
     */
    public function show(Request $request, Team $team): TeamResource
    {
        $this->authorize('view', $team);

        return new TeamResource($team->load(['owner', 'members', 'projects']));
    }

    /**
     * Update a team.
     * PUT /api/teams/{team}
     */
    public function update(Request $request, Team $team): TeamResource
    {
        $this->authorize('update', $team);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string|max:255',
        ]);

        $team = $this->teamService->updateTeam($team, $validated);

        return new TeamResource($team);
    }

    /**
     * Delete a team.
     * DELETE /api/teams/{team}
     */
    public function destroy(Request $request, Team $team): JsonResponse
    {
        $this->authorize('delete', $team);

        $this->teamService->deleteTeam($team);

        return response()->json(['message' => 'Team deleted successfully']);
    }

    /**
     * Get team members.
     * GET /api/teams/{team}/members
     */
    public function members(Request $request, Team $team): AnonymousResourceCollection
    {
        $this->authorize('view', $team);

        $members = $this->teamService->getMembers($team);
        
        return TeamResource::collection(collect([$team->load('members')]))->additional([
            'members' => $members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'avatar' => $member->avatar_url,
                    'role' => $member->pivot->role,
                ];
            }),
        ]);
    }

    /**
     * Add a member to a team.
     * POST /api/teams/{team}/members
     */
    public function addMember(Request $request, Team $team): JsonResponse
    {
       
        $this->authorize('addMember', $team);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'sometimes|in:admin,member',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $role = $validated['role'] ?? 'member';

        // Check if user is already a member
        if ($team->hasMember($user)) {
            return response()->json(['message' => 'User is already a member of this team'], 422);
        }

        $this->teamService->addMember($team, $user, $role);

        return response()->json(['message' => 'Member added successfully'], 201);
    }

    /**
     * Remove a member from a team.
     * DELETE /api/teams/{team}/members/{user}
     */
    public function removeMember(Request $request, Team $team, User $user): JsonResponse
    {
       
        $this->authorize('removeMember', $team);

        // Check if user is a member
        if (!$team->hasMember($user)) {
            return response()->json(['message' => 'User is not a member of this team'], 422);
        }

        try {
            $this->teamService->removeMember($team, $user);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Member removed successfully']);
    }

    /**
     * Update a member's role.
     * PATCH /api/teams/{team}/members/{user}/role
     */
    public function updateMemberRole(Request $request, Team $team, User $user): JsonResponse
    {
       
        $this->authorize('updateMemberRole', $team);

        $validated = $request->validate([
            'role' => 'required|in:admin,member',
        ]);

        // Check if user is a member
        if (!$team->hasMember($user)) {
            return response()->json(['message' => 'User is not a member of this team'], 422);
        }

        try {
            $this->teamService->updateMemberRole($team, $user, $validated['role']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Role updated successfully']);
    }

    /**
     * Get team projects.
     * GET /api/teams/{team}/projects
     */
    public function projects(Request $request, Team $team): AnonymousResourceCollection
    {
       
        $this->authorize('view', $team);

        $projects = $this->teamService->getTeamProjects($team);

        return \App\Http\Resources\ProjectResource::collection($projects);
    }

    /**
     * Assign a project to a team.
     * POST /api/teams/{team}/projects
     */
    public function assignProject(Request $request, Team $team): JsonResponse
    {
       
        $this->authorize('assignProject', $team);

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $project = \App\Models\Project::findOrFail($validated['project_id']);

        // SECURITY: Check if user can access the project (owner or team member)
        $this->authorize('update', $project);

        $project = $this->teamService->assignProjectToTeam($project, $team);

        return response()->json([
            'message' => 'Project assigned to team successfully',
            'project' => new \App\Http\Resources\ProjectResource($project),
        ]);
    }

    /**
     * Remove a project from a team.
     * DELETE /api/teams/{team}/projects/{project}
     */
    public function removeProject(Request $request, Team $team, \App\Models\Project $project): JsonResponse
    {
       
        $this->authorize('removeProject', $team);

        // Check if project belongs to this team
        if ($project->team_id !== $team->id) {
            return response()->json(['message' => 'Project does not belong to this team'], 422);
        }

        $project = $this->teamService->assignProjectToTeam($project, null);

        return response()->json([
            'message' => 'Project removed from team successfully',
            'project' => new \App\Http\Resources\ProjectResource($project),
        ]);
    }

    /**
     * Leave a team.
     * POST /api/teams/{team}/leave
     */
    public function leave(Request $request, Team $team): JsonResponse
    {
       
        $this->authorize('leave', $team);

        try {
            $this->teamService->leaveTeam($team, $request->user());
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['message' => 'You have left the team successfully']);
    }

    /**
     * Get team options (for dropdowns).
     * GET /api/teams/options
     */
    public function options(Request $request): JsonResponse
    {
        $options = $this->teamService->getTeamOptions($request->user());

        return response()->json(['teams' => $options]);
    }
}
