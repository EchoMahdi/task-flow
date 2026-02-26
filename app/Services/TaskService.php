<?php

namespace App\Services;

use App\Events\Task\TaskAssignedToProject;
use App\Events\Task\TaskCompleted;
use App\Events\Task\TaskCreated;
use App\Events\Task\TaskDeleted;
use App\Events\Task\TaskUpdated;
use App\Repositories\TaskRepositoryInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TaskService
{
    protected $taskRepository;

    public function __construct(
        TaskRepositoryInterface $taskRepository
    ) {
        $this->taskRepository = $taskRepository;
    }

    public function getAllTasks(Request $request)
    {
        return $this->taskRepository->getAllTasks($request);
    }

    /**
     * Get tasks for a specific date range (for calendar view)
     */
    public function getTasksForDateRange(array $filters)
    {
        return $this->taskRepository->getTasksForDateRange($filters);
    }

    /**
     * Update task due date (for drag & drop)
     */
    public function updateTaskDate(int $id, string $dueDate)
    {
        $task = $this->taskRepository->getTaskById($id);
        $previousDueDate = $task->due_date ? $task->due_date->toIso8601String() : null;
        
        $updatedTask = $this->taskRepository->updateTask($id, ['due_date' => $dueDate]);
        
        // Dispatch task updated event for due date change
        event(new TaskUpdated([
            'taskId' => (string) $id,
            'projectId' => $task->project_id ? (string) $task->project_id : null,
            'changes' => ['due_date' => $dueDate],
            'previousValues' => ['due_date' => $previousDueDate],
            'title' => $task->title,
        ]));
        
        return $updatedTask;
    }

    public function getTask(int $id)
    {
        return $this->taskRepository->getTaskById($id);
    }

    public function createTask(array $data)
    {
        $task = $this->taskRepository->createTask($data);
        
        // Dispatch task created event
        event(new TaskCreated([
            'taskId' => (string) $task->id,
            'projectId' => $task->project_id ? (string) $task->project_id : null,
            'title' => $task->title,
            'description' => $task->description,
            'priority' => $task->priority,
            'dueDate' => $task->due_date ? $task->due_date->toIso8601String() : null,
            'assigneeId' => $task->assignee_id ? (string) $task->assignee_id : null,
            'tagIds' => $task->tags->pluck('id')->toArray(),
        ]));
        
        return $task;
    }

    public function updateTask(int $id, array $data)
    {
        $task = $this->taskRepository->getTaskById($id);
        $previousValues = $task->toArray();
        
        $updatedTask = $this->taskRepository->updateTask($id, $data);
        
        // Dispatch task updated event
        event(new TaskUpdated([
            'taskId' => (string) $id,
            'projectId' => $task->project_id ? (string) $task->project_id : null,
            'changes' => $data,
            'previousValues' => array_intersect_key($previousValues, $data),
            'title' => $updatedTask->title,
            'tagIds' => $updatedTask->tags->pluck('id')->toArray(),
        ]));
        
        return $updatedTask;
    }

    public function deleteTask(int $id)
    {
        $task = $this->taskRepository->getTaskById($id);
        $projectId = $task->project_id ? (string) $task->project_id : null;
        $tagIds = $task->tags->pluck('id')->toArray();
        
        $result = $this->taskRepository->deleteTask($id);
        
        // Dispatch task deleted event
        event(new TaskDeleted([
            'taskId' => (string) $id,
            'projectId' => $projectId,
            'tagIds' => $tagIds,
        ]));
        
        return $result;
    }

    public function completeTask(int $id)
    {
        $task = $this->taskRepository->getTaskById($id);
        
        $updatedTask = $this->taskRepository->markAsCompleted($id);
        
        // Dispatch task completed event
        event(new TaskCompleted([
            'taskId' => (string) $id,
            'projectId' => $task->project_id ? (string) $task->project_id : null,
            'wasCompleted' => (bool) $task->is_completed,
            'isCompleted' => true,
            'completedAt' => $updatedTask->completed_at ? $updatedTask->completed_at->timestamp : time(),
            'tagIds' => $task->tags->pluck('id')->toArray(),
        ]));
        
        return $updatedTask;
    }

    public function incompleteTask(int $id)
    {
        $task = $this->taskRepository->getTaskById($id);
        
        $updatedTask = $this->taskRepository->markAsIncomplete($id);
        
        // Dispatch task uncompleted event
        event(new TaskCompleted([
            'taskId' => (string) $id,
            'projectId' => $task->project_id ? (string) $task->project_id : null,
            'wasCompleted' => (bool) $task->is_completed,
            'isCompleted' => false,
            'tagIds' => $task->tags->pluck('id')->toArray(),
        ]));
        
        return $updatedTask;
    }

    // =========================================================================
    // Project-Task Operations
    // =========================================================================

    /**
     * Get all standalone tasks (tasks without a project)
     */
    public function getStandaloneTasks(Request $request)
    {
        return $this->taskRepository->getStandaloneTasks($request);
    }

    /**
     * Get all tasks for a specific project
     */
    public function getTasksByProject(int $projectId, Request $request)
    {
        return $this->taskRepository->getTasksByProject($projectId, $request);
    }

    /**
     * Assign a task to a project
     * 
     * @param int $taskId
     * @param int|null $projectId Pass null to make task standalone
     */
    public function assignTaskToProject(int $taskId, ?int $projectId)
    {
        $task = $this->taskRepository->getTaskById($taskId);
        $previousProjectId = $task->project_id ? (string) $task->project_id : null;
        
        $updatedTask = $this->taskRepository->assignToProject($taskId, $projectId);
        
        // Dispatch task assigned to project event
        event(new TaskAssignedToProject([
            'taskId' => (string) $taskId,
            'projectId' => $projectId ? (string) $projectId : null,
            'previousProjectId' => $previousProjectId,
            'tagIds' => $task->tags->pluck('id')->toArray(),
        ]));
        
        return $updatedTask;
    }

    /**
     * Remove a task from its project (make it standalone)
     */
    public function removeTaskFromProject(int $taskId)
    {
        $task = $this->taskRepository->getTaskById($taskId);
        $previousProjectId = $task->project_id ? (string) $task->project_id : null;
        
        $updatedTask = $this->taskRepository->removeFromProject($taskId);
        
        // Dispatch task assigned to project event (with null projectId)
        event(new TaskAssignedToProject([
            'taskId' => (string) $taskId,
            'projectId' => null,
            'previousProjectId' => $previousProjectId,
            'tagIds' => $task->tags->pluck('id')->toArray(),
        ]));
        
        return $updatedTask;
    }

    /**
     * Move a task to a different project
     * 
     * @param int $taskId
     * @param int|null $targetProjectId Pass null to make task standalone
     */
    public function moveTaskToProject(int $taskId, ?int $targetProjectId)
    {
        $task = $this->taskRepository->getTaskById($taskId);
        $previousProjectId = $task->project_id ? (string) $task->project_id : null;
        
        $updatedTask = $this->taskRepository->moveToProject($taskId, $targetProjectId);
        
        // Dispatch task assigned to project event
        event(new TaskAssignedToProject([
            'taskId' => (string) $taskId,
            'projectId' => $targetProjectId ? (string) $targetProjectId : null,
            'previousProjectId' => $previousProjectId,
            'tagIds' => $task->tags->pluck('id')->toArray(),
        ]));
        
        return $updatedTask;
    }

    /**
     * Bulk assign tasks to a project
     * 
     * @param array $taskIds
     * @param int|null $projectId Pass null to make all tasks standalone
     * @return int Number of tasks updated
     */
    public function bulkAssignTasksToProject(array $taskIds, ?int $projectId)
    {
        $count = $this->taskRepository->bulkAssignToProject($taskIds, $projectId);
        
        // Dispatch individual task assignment events for each task
        foreach ($taskIds as $taskId) {
            $task = $this->taskRepository->getTaskById($taskId);
            $previousProjectId = $task->project_id ? (string) $task->project_id : null;
            
            event(new TaskAssignedToProject([
                'taskId' => (string) $taskId,
                'projectId' => $projectId ? (string) $projectId : null,
                'previousProjectId' => $previousProjectId,
                'tagIds' => $task->tags->pluck('id')->toArray(),
            ]));
        }
        
        return $count;
    }
}
