<?php

namespace App\Repositories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Collection;

interface TagRepositoryInterface
{
    /**
     * Get all tags for a specific user.
     *
     * @param int $userId
     * @return Collection
     */
    public function getAllTagsForUser(int $userId): Collection;

    /**
     * Find a tag by ID.
     *
     * @param int $id
     * @return Tag|null
     */
    public function findById(int $id): ?Tag;

    /**
     * Create a new tag.
     *
     * @param int $userId
     * @param array $data
     * @return Tag
     */
    public function createTag(int $userId, array $data): Tag;

    /**
     * Update an existing tag.
     *
     * @param Tag $tag
     * @param array $data
     * @return Tag
     */
    public function updateTag(Tag $tag, array $data): Tag;

    /**
     * Delete a tag.
     *
     * @param Tag $tag
     * @return bool
     */
    public function deleteTag(Tag $tag): bool;
}
