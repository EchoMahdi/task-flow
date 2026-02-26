<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use App\Services\TaskSearchService;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    protected $taskService;
    protected $searchService;
    protected $translator;

    public function __construct(
        TaskService $taskService,
        TaskSearchService $searchService,
        TranslationService $translator
    ) {
        $this->taskService = $taskService;
        $this->searchService = $searchService;
        $this->translator = $translator;
    }

    /**
     * =========================================================================
     * Search Tasks
     * =========================================================================
     *
     * GET /api/tasks/search?q=query&filters...
     *
     * Supported query parameters:
     * - q: Search query string (optional)
     * - project_id: Filter by project (optional)
     * - priority: Filter by priority (optional)
     * - is_completed: Filter by completion status (optional)
     * - tag_id: Filter by tag (optional)
     * - page: Page number (default: 1)
     * - per_page: Items per page (default: 15, max: 100)
     * - sort_by: Sort field - relevance, priority, due_date, created_at, title (default: relevance)
     * - sort_order: asc or desc (default: desc)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['sometimes', 'string', 'min:1', 'max:255'],
            'project_id' => ['sometimes', 'nullable', 'integer'],
            'priority' => ['sometimes', 'nullable', 'string', 'in:low,medium,high'],
            'is_completed' => ['sometimes', 'nullable', 'boolean'],
            'tag_id' => ['sometimes', 'nullable', 'integer'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['sometimes', 'string', 'in:relevance,priority,due_date,created_at,title'],
            'sort_order' => ['sometimes', 'string', 'in:asc,desc'],
        ]);

        $query = $validated['q'] ?? null;
        $filters = array_filter([
            'project_id' => $validated['project_id'] ?? null,
            'priority' => $validated['priority'] ?? null,
            'is_completed' => $validated['is_completed'] ?? null,
            'tag_id' => $validated['tag_id'] ?? null,
        ], fn($v) => $v !== null);

        $options = [
            'page' => $validated['page'] ?? 1,
            'per_page' => $validated['per_page'] ?? 15,
            'sort_by' => $validated['sort_by'] ?? 'relevance',
            'sort_order' => $validated['sort_order'] ?? 'desc',
        ];

        $results = $this->searchService->search($query, $filters, $options);

        return response()->json([
            'data' => TaskResource::collection($results),
            'meta' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'query' => $query,
                'filters_applied' => array_keys($filters),
            ],
        ]);
    }

    /**
     * Quick search for autocomplete/dropdown suggestions
     *
     * GET /api/tasks/search/quick?q=query&limit=5
     */
    public function quickSearch(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'project_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        $limit = $validated['limit'] ?? 10;
        $filters = [];
        if (isset($validated['project_id'])) {
            $filters['project_id'] = $validated['project_id'];
        }

        $results = $this->searchService->quickSearch($validated['q'], $filters, $limit);

        return response()->json([
            'data' => TaskResource::collection($results),
            'meta' => [
                'query' => $validated['q'],
                'limit' => $limit,
                'count' => $results->count(),
            ],
        ]);
    }

    /**
     * Search suggestions (title-only, lightweight)
     *
     * GET /api/tasks/search/suggestions?q=partial
     */
    public function suggestions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:1'],
        ]);

        $suggestions = $this->searchService->getSuggestions($validated['q']);

        return response()->json([
            'suggestions' => $suggestions,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['sometimes', 'string', 'in:due_date,priority,created_at,title'],
            'sort_order' => ['sometimes', 'string', 'in:asc,desc'],
            'search' => ['sometimes', 'nullable', 'string', 'min:1', 'max:255'],
            'status' => ['sometimes', 'nullable', 'string', 'in:pending,completed,all'],
            'priority' => ['sometimes', 'nullable', 'string', 'in:low,medium,high'],
            'project_id' => ['sometimes', 'nullable', 'integer'],
            'tag_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        // Map status to is_completed for repository
        $request->merge([
            'is_completed' => isset($validated['status']) && $validated['status'] !== 'all' 
                ? ($validated['status'] === 'completed' ? true : false) 
                : null,
        ]);

        $tasks = $this->taskService->getAllTasks($request);
        
        return response()->json([
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    /**
     * =========================================================================
     * PERFORMANCE OPTIMIZED: Eager Loading for Policy Authorization
     * =========================================================================
     * 
     * This method demonstrates how to properly use Eager Loading BEFORE
     * calling authorization checks to prevent N+1 queries.
     * 
     * PROBLEM:
     * When looping through tasks and calling $this->authorize() on each one,
     * Laravel's Policy checks $task->project->team->hasMember($user).
     * Without eager loading, each task triggers:
     *   1. Query to fetch the project
     *   2. Query to fetch the team (if project has team_id)
     *   3. Query to check team membership
     * 
     * For N tasks, this results in 3N+ queries (N+1 problem).
     * 
     * SOLUTION:
     * 1. Eager load 'project.team' relationship BEFORE the loop
     * 2. This loads all projects and teams in just 2 queries total
     * 3. Combined with TaskPolicy caching, subsequent authorization checks
     *    use cached results instead of hitting the database
     * 
     * HOW IT WORKS WITH TASKPOLICY CACHING:
     * - First task checks team membership → queries DB, caches result
     * - All subsequent tasks in same team → uses cached result (0 queries)
     * - Different team → queries DB once, caches that team's result
     * 
     * RESULT: For 100 tasks with 5 different teams, instead of 300+ queries,
     * we get ~7 queries (2 for eager loading + 5 for team membership checks).
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function indexWithEagerLoading(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['sometimes', 'string', 'in:due_date,priority,created_at,title'],
            'sort_order' => ['sometimes', 'string', 'in:asc,desc'],
            'search' => ['sometimes', 'nullable', 'string', 'min:1', 'max:255'],
            'status' => ['sometimes', 'nullable', 'string', 'in:pending,completed,all'],
            'priority' => ['sometimes', 'nullable', 'string', 'in:low,medium,high'],
            'project_id' => ['sometimes', 'nullable', 'integer'],
            'tag_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        // Map status to is_completed for repository
        $request->merge([
            'is_completed' => isset($validated['status']) && $validated['status'] !== 'all' 
                ? ($validated['status'] === 'completed' ? true : false) 
                : null,
        ]);

        // =========================================================================
        // STEP 1: EAGER LOAD RELATIONSHIPS REQUIRED BY POLICY
        // =========================================================================
        // The TaskPolicy checks these relationships:
        // - $task->project (for project ownership check)
        // - $task->project->team (for team membership check)
        // - $task->user_id (for task ownership check)
        // 
        // By eager loading 'project.team', we fetch all related data upfront
        // instead of lazy loading it inside the policy for each task.
        // =========================================================================
        $tasks = $this->taskService->getAllTasks($request);
        
        // Get the task IDs for authorization
        $taskIds = $tasks->pluck('id')->toArray();
        
        if (!empty($taskIds)) {
            // =========================================================================
            // STEP 2: BULK LOAD AUTHORIZATION DATA
            // =========================================================================
            // Load all tasks with their required relationships for policy checks.
            // This single query loads ALL tasks + their projects + team relationships.
            // 
            // Without this: 1 query per task = N queries
            // With this: 1 query for all = 1 query
            // =========================================================================
            $tasksWithRelations = Task::with(['project.team'])
                ->whereIn('id', $taskIds)
                ->get()
                ->keyBy('id');
            
            // =========================================================================
            // STEP 3: AUTHORIZE EACH TASK
            // =========================================================================
            // Now when we call $this->authorize(), the Policy can access
            // $task->project->team without triggering additional queries.
            // Combined with the Policy's caching, this achieves optimal performance.
            // =========================================================================
            foreach ($tasksWithRelations as $task) {
                $this->authorize('view', $task);
            }
        }
        
        return response()->json([
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    /**
     * =========================================================================
     * PERFORMANCE OPTIMIZED: Bulk Authorization with Eager Loading
     * =========================================================================
     * 
     * Demonstrates bulk authorization pattern for operations like bulk-update,
     * bulk-delete, or any scenario where multiple tasks need authorization.
     * 
     * This pattern is especially useful for:
     * - Bulk operations (PATCH /tasks/bulk-update)
     * - Displaying task lists with action buttons
     * - Admin dashboards showing all tasks
     * 
     * @param Request $request
     * @param array $taskIds Array of task IDs to authorize
     * @param string $ability The policy ability to check
     * @return void
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    protected function authorizeBulkTasks(array $taskIds, string $ability = 'view'): void
    {
        if (empty($taskIds)) {
            return;
        }

        // =========================================================================
        // STEP 1: EAGER LOAD ALL REQUIRED RELATIONSHIPS
        // =========================================================================
        // This is the KEY optimization. Load all relationships that ANY policy
        // method might need in a single query.
        //
        // For TaskPolicy, we need:
        // - project (for project ownership check)
        // - project.team (for team membership/admin checks)
        // =========================================================================
        $tasks = Task::with([
            'project.team',
            'project',
        ])->whereIn('id', $taskIds)->get();

        // =========================================================================
        // STEP 2: AUTHORIZE EACH TASK
        // =========================================================================
        // With relationships pre-loaded, each authorize() call can access
        // $task->project->team without triggering additional queries.
        // Combined with TaskPolicy caching, this achieves optimal performance.
        // =========================================================================
        foreach ($tasks as $task) {
            $this->authorize($ability, $task);
        }
    }

    /**
     * Get tasks for calendar view
     * Supports date range queries for efficient loading
     */
    public function calendar(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'array'],
            'priority' => ['sometimes', 'array'],
            'include_completed' => ['sometimes', 'boolean'],
        ]);

        $tasks = $this->taskService->getTasksForDateRange($validated);
        
        return response()->json([
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'total' => $tasks->count(),
            ],
        ]);
    }

    /**
     * Update task date (for drag & drop)
     */
    public function updateDate(Request $request, Task $task): JsonResponse
    {
       
        $this->authorize('updateDate', $task);

        $validated = $request->validate([
            'due_date' => ['required', 'date'],
        ]);

        $task = $this->taskService->updateTaskDate($task->id, $validated['due_date']);
        
        return response()->json([
            'message' => $this->translator->get('tasks.update_success'),
            'data' => new TaskResource($task),
        ]);
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());
        
        return response()->json([
            'message' => $this->translator->get('tasks.create.success'),
            'data' => new TaskResource($task),
        ], 201);
    }

    public function show(Task $task): JsonResponse
    {
       
        $this->authorize('view', $task);
        
        return response()->json([
            'data' => new TaskResource($task->load('tags', 'project')),
        ]);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
       
        $this->authorize('update', $task);

        $task = $this->taskService->updateTask($task->id, $request->validated());
        
        return response()->json([
            'message' => $this->translator->get('tasks.update.success'),
            'data' => new TaskResource($task),
        ]);
    }

    public function destroy(Task $task): JsonResponse
    {
       
        $this->authorize('delete', $task);

        $this->taskService->deleteTask($task->id);
        
        return response()->json([
            'message' => $this->translator->get('tasks.delete.success'),
        ]);
    }

    public function complete(Task $task): JsonResponse
    {
       
        $this->authorize('complete', $task);

        $task = $this->taskService->completeTask($task->id);
        
        return response()->json([
            'message' => $this->translator->get('tasks.complete.success'),
            'data' => new TaskResource($task),
        ]);
    }

    public function incomplete(Task $task): JsonResponse
    {
       
        $this->authorize('complete', $task);

        $task = $this->taskService->incompleteTask($task->id);
        
        return response()->json([
            'message' => $this->translator->get('tasks.complete.undone'),
            'data' => new TaskResource($task),
        ]);
    }

    /**
     * Get task options (status, priority) for dropdowns
     *
     * GET /api/tasks/options
     */
    public function options(): JsonResponse
    {
        return response()->json([
            'data' => [
                'statuses' => [
                    ['value' => 'pending', 'label' => 'Pending', 'color' => 'default'],
                    ['value' => 'in_progress', 'label' => 'In Progress', 'color' => 'primary'],
                    ['value' => 'completed', 'label' => 'Completed', 'color' => 'success'],
                ],
                'priorities' => [
                    ['value' => 'low', 'label' => 'Low', 'color' => 'success'],
                    ['value' => 'medium', 'label' => 'Medium', 'color' => 'warning'],
                    ['value' => 'high', 'label' => 'High', 'color' => 'error'],
                    ['value' => 'urgent', 'label' => 'Urgent', 'color' => 'error'],
                ],
                // Filter options include 'all' for convenience
                'statusFilterOptions' => [
                    ['value' => 'all', 'label' => 'All Status'],
                    ['value' => 'pending', 'label' => 'Pending'],
                    ['value' => 'in_progress', 'label' => 'In Progress'],
                    ['value' => 'completed', 'label' => 'Completed'],
                ],
                'priorityFilterOptions' => [
                    ['value' => 'all', 'label' => 'All Priority'],
                    ['value' => 'high', 'label' => 'High'],
                    ['value' => 'medium', 'label' => 'Medium'],
                    ['value' => 'low', 'label' => 'Low'],
                ],
            ],
        ]);
    }

    // =========================================================================
    // Project-Task Operations
    // =========================================================================

    /**
     * Get all standalone tasks (tasks without a project)
     *
     * GET /api/tasks/standalone
     */
    public function standalone(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'sort_by' => ['sometimes', 'string', 'in:due_date,priority,created_at,title'],
            'sort_order' => ['sometimes', 'string', 'in:asc,desc'],
            'status' => ['sometimes', 'nullable', 'string', 'in:pending,completed,all'],
            'priority' => ['sometimes', 'nullable', 'string', 'in:low,medium,high'],
        ]);

        $tasks = $this->taskService->getStandaloneTasks($request);

        return response()->json([
            'data' => TaskResource::collection($tasks),
            'meta' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    /**
     * Assign a task to a project
     *
     * PATCH /api/tasks/{id}/assign-project
     * Request body: { "project_id": 1 } or { "project_id": null } to remove from project
     */
    public function assignToProject(Request $request, Task $task): JsonResponse
    {
       
        $this->authorize('assignToProject', $task);

        $validated = $request->validate([
            'project_id' => [
                'nullable',
                'integer',
                Rule::exists('projects', 'id')->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id);
                })
            ],
        ]);

        $task = $this->taskService->assignTaskToProject($task->id, $validated['project_id'] ?? null);

        $message = $validated['project_id'] === null
            ? $this->translator->get('tasks.removed_from_project')
            : $this->translator->get('tasks.assigned_to_project');

        return response()->json([
            'message' => $message,
            'data' => new TaskResource($task),
        ]);
    }

    /**
     * Remove a task from its project (make it standalone)
     *
     * PATCH /api/tasks/{id}/remove-from-project
     */
    public function removeFromProject(Task $task): JsonResponse
    {
       
        $this->authorize('assignToProject', $task);

        $task = $this->taskService->removeTaskFromProject($task->id);

        return response()->json([
            'message' => $this->translator->get('tasks.removed_from_project'),
            'data' => new TaskResource($task),
        ]);
    }

    /**
     * Move a task to a different project
     *
     * PATCH /api/tasks/{id}/move-to-project
     * Request body: { "project_id": 1 } or { "project_id": null } to make standalone
     */
    public function moveToProject(Request $request, Task $task): JsonResponse
    {
       
        $this->authorize('assignToProject', $task);

        $validated = $request->validate([
            'project_id' => [
                'nullable',
                'integer',
                Rule::exists('projects', 'id')->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id);
                })
            ],
        ]);

        $task = $this->taskService->moveTaskToProject($task->id, $validated['project_id'] ?? null);

        $message = $validated['project_id'] === null
            ? $this->translator->get('tasks.moved_to_standalone')
            : $this->translator->get('tasks.moved_to_project');

        return response()->json([
            'message' => $message,
            'data' => new TaskResource($task),
        ]);
    }

    /**
     * Bulk assign tasks to a project
     *
     * POST /api/tasks/bulk-assign-project
     * Request body: { "task_ids": [1, 2, 3], "project_id": 1 } or { "project_id": null } to make all standalone
     */
    public function bulkAssignToProject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'task_ids' => ['required', 'array', 'min:1'],
            'task_ids.*' => ['required', 'integer', 'exists:tasks,id'],
            'project_id' => [
                'nullable',
                'integer',
                Rule::exists('projects', 'id')->where(function ($query) use ($request) {
                    $query->where('user_id', $request->user()->id);
                })
            ],
        ]);

        // SECURITY: Authorize each task before bulk operation
        $tasks = Task::whereIn('id', $validated['task_ids'])->get();
        foreach ($tasks as $task) {
            $this->authorize('assignToProject', $task);
        }

        $count = $this->taskService->bulkAssignTasksToProject(
            $validated['task_ids'],
            $validated['project_id'] ?? null
        );

        $message = $validated['project_id'] === null
            ? $this->translator->get('tasks.bulk_removed_from_project', ['count' => $count])
            : $this->translator->get('tasks.bulk_assigned_to_project', ['count' => $count]);

        return response()->json([
            'message' => $message,
            'data' => [
                'updated_count' => $count,
                'project_id' => $validated['project_id'] ?? null,
            ],
        ]);
    }
}
