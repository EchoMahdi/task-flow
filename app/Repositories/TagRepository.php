<?php

namespace App\Repositories;

use App\Models\Tag;
use Illuminate\Support\Facades\Auth;

class TagRepository implements TagRepositoryInterface
{
    protected $tag;

    public function __construct(Tag $tag)
    {
        $this->tag = $tag;
    }

    public function getAllTags()
    {
        return $this->tag->where('user_id', Auth::id())
            ->withCount('tasks')
            ->orderBy('name')
            ->get();
    }

    public function getTagById(int $id)
    {
        return $this->tag->where('user_id', Auth::id())->findOrFail($id);
    }

    public function createTag(array $data)
    {
        return Auth::user()->tags()->create($data);
    }

    public function updateTag(int $id, array $data)
    {
        $tag = $this->getTagById($id);
        $tag->update($data);
        return $tag;
    }

    public function deleteTag(int $id)
    {
        $tag = $this->getTagById($id);
        $tag->tasks()->detach();
        return $tag->delete();
    }
}
