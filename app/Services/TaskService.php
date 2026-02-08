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
}
