<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use App\Services\TaskSearchService;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
    public function updateDate(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'due_date' => ['required', 'date'],
        ]);

        $task = $this->taskService->updateTaskDate($id, $validated['due_date']);
        
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

    public function show(int $id): JsonResponse
    {
        $task = $this->taskService->getTask($id);
        
        return response()->json([
            'data' => new TaskResource($task),
        ]);
    }

    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $task = $this->taskService->updateTask($id, $request->validated());
        
        return response()->json([
            'message' => $this->translator->get('tasks.update.success'),
            'data' => new TaskResource($task),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->taskService->deleteTask($id);
        
        return response()->json([
            'message' => $this->translator->get('tasks.delete.success'),
        ]);
    }

    public function complete(int $id): JsonResponse
    {
        $task = $this->taskService->completeTask($id);
        
        return response()->json([
            'message' => $this->translator->get('tasks.complete.success'),
            'data' => new TaskResource($task),
        ]);
    }

    public function incomplete(int $id): JsonResponse
    {
        $task = $this->taskService->incompleteTask($id);
        
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
}
