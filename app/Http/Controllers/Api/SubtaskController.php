<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subtask;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubtaskController extends Controller
{
    /**
     * Get all subtasks for a task
     */
    public function index(int $taskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        
        // Ensure user owns the task
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
     */
    public function store(Request $request, int $taskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        
        // Ensure user owns the task
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
     */
    public function update(Request $request, int $taskId, int $subtaskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        
        // Ensure user owns the task
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subtask = Subtask::where('task_id', $taskId)->findOrFail($subtaskId);

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
     */
    public function toggleComplete(Request $request, int $taskId, int $subtaskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        
        // Ensure user owns the task
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subtask = Subtask::where('task_id', $taskId)->findOrFail($subtaskId);

        $subtask->is_completed = !$subtask->is_completed;
        $subtask->save();

        return response()->json([
            'message' => $subtask->is_completed ? 'Subtask completed' : 'Subtask marked as incomplete',
            'data' => $subtask->fresh(),
        ]);
    }

    /**
     * Delete a subtask
     */
    public function destroy(int $taskId, int $subtaskId): JsonResponse
    {
        $task = Task::findOrFail($taskId);
        
        // Ensure user owns the task
        if ($task->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $subtask = Subtask::where('task_id', $taskId)->findOrFail($subtaskId);
        
        $subtask->delete();

        return response()->json([
            'message' => 'Subtask deleted successfully',
        ]);
    }
}
