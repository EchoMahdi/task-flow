<?php

namespace App\Repositories;

use Illuminate\Http\Request;

interface TaskRepositoryInterface
{
    public function getAllTasks(Request $request);
    public function getTasksForDateRange(array $filters);
    public function getTaskById(int $id);
    public function createTask(array $data);
    public function updateTask(int $id, array $data);
    public function deleteTask(int $id);
    public function markAsCompleted(int $id);
    public function markAsIncomplete(int $id);
    public function getTasksByUser(int $userId);

    /**
     * Get all standalone tasks (tasks without a project)
     */
    public function getStandaloneTasks(Request $request);

    /**
     * Get all tasks for a specific project
     */
    public function getTasksByProject(int $projectId, Request $request);

    /**
     * Assign a task to a project
     */
    public function assignToProject(int $taskId, ?int $projectId);

    /**
     * Remove a task from its project (make it standalone)
     */
    public function removeFromProject(int $taskId);

    /**
     * Move a task to a different project
     */
    public function moveToProject(int $taskId, ?int $targetProjectId);

    /**
     * Bulk assign tasks to a project
     */
    public function bulkAssignToProject(array $taskIds, ?int $projectId);
}
