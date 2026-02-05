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
            ->filter($request->all())
            ->orderByPriority()
            ->orderBy('created_at', 'desc');

        return $query->paginate($request->get('per_page', 15));
    }

    public function getTaskById(int $id)
    {
        return $this->task->where('user_id', Auth::id())->with('tags')->findOrFail($id);
    }

    public function createTask(array $data)
    {
        $task = Auth::user()->tasks()->create($data);

        if (isset($data['tags'])) {
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
