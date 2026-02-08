<?php

namespace App\Repositories;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskRepository implements TaskRepositoryInterface
{
    protected $task;

    public function __construct(Task $task)
    {
        $this->task = $task;
    }

    public function getAllTasks(Request $request)
    {
        $query = $this->task->where('user_id', Auth::id())
            ->with('tags')
            ->filter($request->all());

        // Apply dynamic sorting based on request parameters
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $sortBy = in_array($sortBy, ['due_date', 'priority', 'created_at', 'title']) ? $sortBy : 'created_at';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';

        // Apply priority sorting with custom order if sort_by is priority
        if ($sortBy === 'priority') {
            $query->orderByPriority();
            // Secondary sort by created_at for same priority
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->paginate($request->get('per_page', 15));
    }

    /**
     * Get tasks for a specific date range (for calendar view)
     * Uses standard Gregorian dates only - calendar conversion happens on frontend
     */
    public function getTasksForDateRange(array $filters)
    {
        $query = $this->task->where('user_id', Auth::id())
            ->with('tags');

        // Date range filter
        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $query->whereBetween('due_date', [
                $filters['start_date'],
                $filters['end_date']
            ]);
        }

        // Status filter
        if (isset($filters['status']) && is_array($filters['status'])) {
            $query->whereIn('status', $filters['status']);
        }

        // Priority filter
        if (isset($filters['priority']) && is_array($filters['priority'])) {
            $query->whereIn('priority', $filters['priority']);
        }

        // Include/exclude completed
        if (isset($filters['include_completed'])) {
            if (!$filters['include_completed']) {
                $query->where('is_completed', false);
            }
        } else {
            // By default, exclude completed tasks
            $query->where('is_completed', false);
        }

        return $query->orderBy('due_date', 'asc')->get();
    }

    public function getTaskById(int $id)
    {
        // DUPLICATION: ->where('user_id', Auth::id())->with('tags') pattern repeated in getAllTasks, getTasksForDateRange
        return $this->task->where('user_id', Auth::id())->with('tags')->findOrFail($id);
    }

    public function createTask(array $data)
    {
        $task = Auth::user()->tasks()->create($data);

        if (isset($data['tags'])) {
            // DUPLICATION: tags attach/sync/detach pattern repeated in createTask, updateTask, deleteTask
            $task->tags()->attach($data['tags']);
        }

        return $task->load('tags');
    }

    public function updateTask(int $id, array $data)
    {
        $task = $this->getTaskById($id);
        
        $task->update($data);

        if (isset($data['tags'])) {
            $task->tags()->sync($data['tags']);
        }

        return $task->load('tags');
    }

    public function deleteTask(int $id)
    {
        $task = $this->getTaskById($id);
        $task->tags()->detach();
        return $task->delete();
    }

    public function markAsCompleted(int $id)
    {
        $task = $this->getTaskById($id);
        $task->markAsCompleted();
        return $task->load('tags');
    }

    public function markAsIncomplete(int $id)
    {
        $task = $this->getTaskById($id);
        $task->markAsIncomplete();
        return $task->load('tags');
    }

    public function getTasksByUser(int $userId)
    {
        return $this->task->where('user_id', $userId)->with('tags')->get();
    }
}
