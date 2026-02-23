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
            ->with('tags', 'project')
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
            ->with('tags', 'project');

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
        return $this->task->where('user_id', Auth::id())->with('tags', 'project')->findOrFail($id);
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

    /**
     * Apply common sorting and filtering to a task query
     * 
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param Request $request
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function applySortingAndFiltering($query, Request $request)
    {
        // Apply filters
        $query->filter($request->all());

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $sortBy = in_array($sortBy, ['due_date', 'priority', 'created_at', 'title']) ? $sortBy : 'created_at';
        $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? strtolower($sortOrder) : 'desc';

        if ($sortBy === 'priority') {
            $query->orderByPriority();
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query;
    }

    /**
     * Get all standalone tasks (tasks without a project)
     *
     * @param Request $request
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getStandaloneTasks(Request $request)
    {
        $query = $this->task->where('user_id', Auth::id())
            ->whereNull('project_id')
            ->with('tags', 'project');

        $query = $this->applySortingAndFiltering($query, $request);

        return $query->paginate($request->get('per_page', 15));
    }

    /**
     * Get all tasks for a specific project
     *
     * @param int $projectId
     * @param Request $request
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getTasksByProject(int $projectId, Request $request)
    {
        $query = $this->task->where('user_id', Auth::id())
            ->where('project_id', $projectId)
            ->with('tags', 'project');

        $query = $this->applySortingAndFiltering($query, $request);

        return $query->paginate($request->get('per_page', 15));
    }

    /**
     * Assign a task to a project
     *
     * @param int $taskId
     * @param int|null $projectId
     * @return Task
     */
    public function assignToProject(int $taskId, ?int $projectId)
    {
        $task = $this->getTaskById($taskId);
        
        // If projectId is provided, verify the project exists and belongs to user
        if ($projectId !== null) {
            $project = \App\Models\Project::where('user_id', Auth::id())
                ->where('id', $projectId)
                ->firstOrFail();
        }

        $task->update(['project_id' => $projectId]);

        return $task->load('tags', 'project');
    }

    /**
     * Remove a task from its project (make it standalone)
     *
     * @param int $taskId
     * @return Task
     */
    public function removeFromProject(int $taskId)
    {
        return $this->assignToProject($taskId, null);
    }

    /**
     * Move a task to a different project
     *
     * @param int $taskId
     * @param int|null $targetProjectId
     * @return Task
     */
    public function moveToProject(int $taskId, ?int $targetProjectId)
    {
        return $this->assignToProject($taskId, $targetProjectId);
    }

    /**
     * Bulk assign tasks to a project
     *
     * @param array $taskIds
     * @param int|null $projectId
     * @return int Number of tasks updated
     */
    public function bulkAssignToProject(array $taskIds, ?int $projectId)
    {
        // If projectId is provided, verify the project exists and belongs to user
        if ($projectId !== null) {
            \App\Models\Project::where('user_id', Auth::id())
                ->where('id', $projectId)
                ->firstOrFail();
        }

        return $this->task->where('user_id', Auth::id())
            ->whereIn('id', $taskIds)
            ->update(['project_id' => $projectId]);
    }
}
