<?php

namespace App\Repositories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;

/**
 * Tag Repository
 *
 * Data access layer for Tag entities.
 * IMPORTANT: This repository is completely unaware of HTTP context.
 * All user context must be passed explicitly via method parameters.
 */
class TagRepository implements TagRepositoryInterface
{
    protected Tag $tag;

    public function __construct(Tag $tag)
    {
        $this->tag = $tag;
    }

    /**
     * Get all tags for a specific user.
     *
     * @param int $userId
     * @return Collection
     */
    public function getAllTagsForUser(int $userId): Collection
    {
        return $this->tag->newQuery()
            ->where('user_id', $userId)
            ->withCount('tasks')
            ->orderBy('name')
            ->get();
    }

    /**
     * Find a tag by ID.
     *
     * @param int $id
     * @return Tag|null
     */
    public function findById(int $id): ?Tag
    {
        return $this->tag->newQuery()->find($id);
    }

    /**
     * Create a new tag.
     *
     * @param int $userId
     * @param array $data
     * @return Tag
     */
    public function createTag(int $userId, array $data): Tag
    {
        $data['user_id'] = $userId;
        return $this->tag->newQuery()->create($data);
    }

    /**
     * Update an existing tag.
     *
     * @param Tag $tag
     * @param array $data
     * @return Tag
     */
    public function updateTag(Tag $tag, array $data): Tag
    {
        $tag->update($data);
        return $tag->fresh();
    }

    /**
     * Delete a tag.
     *
     * @param Tag $tag
     * @return bool
     */
    public function deleteTag(Tag $tag): bool
    {
        $tag->tasks()->detach();
        return $tag->delete();
    }
}
