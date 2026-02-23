<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Models\Project;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    /**
     * Get all projects for the authenticated user
     *
     * GET /api/projects
     * Returns: { favorites: [], other: [] }
     */
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->withCount(['tasks' => function ($query) {
                $query->where('is_completed', false);
            }])
            ->orderBy('is_favorite', 'desc')
            ->orderBy('name')
            ->get();

        $favorites = $projects->where('is_favorite', true);
        $other = $projects->where('is_favorite', false);

        return response()->json([
            'favorites' => ProjectResource::collection($favorites),
            'other' => ProjectResource::collection($other),
        ]);
    }

    /**
     * Get a single project with statistics
     *
     * GET /api/projects/{id}
     */
    public function show(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $project->loadCount([
            'tasks',
            'tasks as completed_tasks_count' => function ($query) {
                $query->where('is_completed', true);
            },
            'tasks as pending_tasks_count' => function ($query) {
                $query->where('is_completed', false);
            },
        ]);

        return response()->json([
            'project' => new ProjectResource($project),
        ]);
    }

    /**
     * Get all tasks for a specific project
     *
     * GET /api/projects/{id}/tasks
     */
    public function tasks(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $tasks = $this->taskService->getTasksByProject($project->id, $request);

        return response()->json([
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
                'project_id' => $project->id,
                'project_name' => $project->name,
            ],
        ]);
    }

    /**
     * Get project statistics
     *
     * GET /api/projects/{id}/statistics
     */
    public function statistics(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $statistics = DB::table('tasks')
            ->where('project_id', $project->id)
            ->select([
                DB::raw('COUNT(*) as total_tasks'),
                DB::raw('SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_tasks'),
                DB::raw('SUM(CASE WHEN is_completed = 0 THEN 1 ELSE 0 END) as pending_tasks'),
                DB::raw('SUM(CASE WHEN priority = "high" AND is_completed = 0 THEN 1 ELSE 0 END) as high_priority_tasks'),
                DB::raw('SUM(CASE WHEN is_completed = 0 AND due_date IS NOT NULL AND due_date < NOW() THEN 1 ELSE 0 END) as overdue_tasks'),
            ])
            ->first();

        $total = $statistics->total_tasks;
        $completed = $statistics->completed_tasks;
        $completionRate = $total > 0 ? round(($completed / $total) * 100, 1) : 0;

        return response()->json([
            'statistics' => [
                'total_tasks' => $total,
                'completed_tasks' => $completed,
                'pending_tasks' => $statistics->pending_tasks,
                'high_priority_tasks' => $statistics->high_priority_tasks,
                'overdue_tasks' => $statistics->overdue_tasks,
                'completion_rate' => $completionRate,
            ],
        ]);
    }

    /**
     * Create a new project
     *
     * POST /api/projects
     * Input: { name, icon, color }
     * Validation: name required, unique per user
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:projects,name,NULL,id,user_id,' . $request->user()->id,
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = $request->user()->projects()->create([
            'name' => $request->name,
            'icon' => $request->icon ?? 'folder',
            'color' => $request->color ?? '#3B82F6',
            'is_favorite' => false,
        ]);

        $project->loadCount(['tasks' => function ($query) {
            $query->where('is_completed', false);
        }]);

        return response()->json([
            'project' => new ProjectResource($project),
            'message' => 'Project created successfully',
        ], 201);
    }

    /**
     * Update a project
     *
     * PUT /api/projects/{id}
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255|unique:projects,name,' . $project->id . ',id,user_id,' . $request->user()->id,
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project->update($request->only(['name', 'icon', 'color']));

        $project->loadCount(['tasks' => function ($query) {
            $query->where('is_completed', false);
        }]);

        return response()->json([
            'project' => new ProjectResource($project),
            'message' => 'Project updated successfully',
        ]);
    }

    /**
     * Update favorite status
     *
     * PATCH /api/projects/{id}/favorite
     * Input: { is_favorite: bool }
     */
    public function updateFavorite(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_favorite' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project->update([
            'is_favorite' => $request->is_favorite,
        ]);

        return response()->json([
            'project' => new ProjectResource($project),
            'message' => 'Project favorite status updated',
        ]);
    }

    /**
     * Delete a project
     * 
     * Note: Tasks will NOT be deleted. They will become standalone tasks
     * due to the SET NULL foreign key constraint.
     *
     * DELETE /api/projects/{id}
     */
    public function destroy(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get task count before deletion for the response message
        $taskCount = $project->tasks()->count();

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
            'data' => [
                'tasks_preserved' => $taskCount,
                'message' => $taskCount > 0 
                    ? "{$taskCount} tasks have been moved to standalone"
                    : null,
            ],
        ]);
    }
}
