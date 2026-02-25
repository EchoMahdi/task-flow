<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subtask;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{
    /**
     * Get all subtasks for a task
     *
     * @param Task $task
     * @return JsonResponse
     */
    public function index(Task $task): JsonResponse
    {
        $this->authorize('view', $task);

        $subtasks = $task->subtasks;

        return response()->json([
            'data' => $subtasks,
            'meta' => [
                'total' => $subtasks->count(),
                'completed' => $subtasks->where('is_completed', true)->count(),
            ],
        ]);
    }

    /**
     * Store a new subtask
     *
     * @param Request $request
     * @param Task $task
     * @return JsonResponse
     */
    public function store(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
        ]);

        // Get the next order value if not provided
        if (!isset($validated['order'])) {
            $maxOrder = $task->subtasks()->max('order');
            $validated['order'] = $maxOrder ? $maxOrder + 1 : 0;
        }

        $subtask = $task->subtasks()->create($validated);

        return response()->json([
            'message' => 'Subtask created successfully',
            'data' => $subtask,
        ], 201);
    }

    /**
     * Update a subtask
     *
     * @param Request $request
     * @param Task $task
     * @param Subtask $subtask
     * @return JsonResponse
     */
    public function update(Request $request, Task $task, Subtask $subtask): JsonResponse
    {
        $this->authorize('update', $subtask);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_completed' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer'],
        ]);

        $subtask->update($validated);

        return response()->json([
            'message' => 'Subtask updated successfully',
            'data' => $subtask->fresh(),
        ]);
    }

    /**
     * Toggle subtask completion
     *
     * @param Request $request
     * @param Task $task
     * @param Subtask $subtask
     * @return JsonResponse
     */
    public function toggleComplete(Request $request, Task $task, Subtask $subtask): JsonResponse
    {
        $this->authorize('toggleComplete', $subtask);

        $subtask->is_completed = !$subtask->is_completed;
        $subtask->save();

        return response()->json([
            'message' => $subtask->is_completed ? 'Subtask completed' : 'Subtask marked as incomplete',
            'data' => $subtask->fresh(),
        ]);
    }

    /**
     * Delete a subtask
     *
     * @param Task $task
     * @param Subtask $subtask
     * @return JsonResponse
     */
    public function destroy(Task $task, Subtask $subtask): JsonResponse
    {
        $this->authorize('delete', $subtask);

        $subtask->delete();

        return response()->json([
            'message' => 'Subtask deleted successfully',
        ]);
    }
}
