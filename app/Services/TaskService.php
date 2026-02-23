<?php

namespace App\Services;

use App\Repositories\TaskRepositoryInterface;
use Illuminate\Http\Request;

class TaskService
{
    protected $taskRepository;

    public function __construct(TaskRepositoryInterface $taskRepository)
    {
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
        return $this->taskRepository->updateTask($id, ['due_date' => $dueDate]);
    }

    public function getTask(int $id)
    {
        return $this->taskRepository->getTaskById($id);
    }

    public function createTask(array $data)
    {
        return $this->taskRepository->createTask($data);
    }

    public function updateTask(int $id, array $data)
    {
        return $this->taskRepository->updateTask($id, $data);
    }

    public function deleteTask(int $id)
    {
        return $this->taskRepository->deleteTask($id);
    }

    public function completeTask(int $id)
    {
        return $this->taskRepository->markAsCompleted($id);
    }

    public function incompleteTask(int $id)
    {
        return $this->taskRepository->markAsIncomplete($id);
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
        return $this->taskRepository->assignToProject($taskId, $projectId);
    }

    /**
     * Remove a task from its project (make it standalone)
     */
    public function removeTaskFromProject(int $taskId)
    {
        return $this->taskRepository->removeFromProject($taskId);
    }

    /**
     * Move a task to a different project
     * 
     * @param int $taskId
     * @param int|null $targetProjectId Pass null to make task standalone
     */
    public function moveTaskToProject(int $taskId, ?int $targetProjectId)
    {
        return $this->taskRepository->moveToProject($taskId, $targetProjectId);
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
        return $this->taskRepository->bulkAssignToProject($taskIds, $projectId);
    }
}
