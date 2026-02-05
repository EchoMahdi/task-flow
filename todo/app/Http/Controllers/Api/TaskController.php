<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    protected $taskService;
    protected $translator;

    public function __construct(TaskService $taskService, TranslationService $translator)
    {
        $this->taskService = $taskService;
        $this->translator = $translator;
    }

    public function index(Request $request): JsonResponse
    {
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
}
