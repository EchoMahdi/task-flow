<?php

namespace App\Repositories;

use Illuminate\Http\Request;

interface TaskRepositoryInterface
{
    public function getAllTasks(Request $request);
    public function getTaskById(int $id);
    public function createTask(array $data);
    public function updateTask(int $id, array $data);
    public function deleteTask(int $id);
    public function markAsCompleted(int $id);
    public function markAsIncomplete(int $id);
    public function getTasksByUser(int $userId);
}
