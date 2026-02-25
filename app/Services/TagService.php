<?php

namespace App\Services;

use App\Models\Tag;
use App\Repositories\TagRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

/**
 * Tag Service
 *
 * Application service for Tag operations.
 * Coordinates between controllers and repositories.
 * User context is passed explicitly from the controller layer.
 */
class TagService
{
    protected TagRepositoryInterface $tagRepository;

    public function __construct(TagRepositoryInterface $tagRepository)
    {
        $this->tagRepository = $tagRepository;
    }

    /**
     * Get all tags for a specific user.
     *
     * @param int $userId
     * @return Collection
     */
    public function getAllTagsForUser(int $userId): Collection
    {
        return $this->tagRepository->getAllTagsForUser($userId);
    }

    /**
     * Find a tag by ID.
     *
     * @param int $id
     * @return Tag|null
     */
    public function findById(int $id): ?Tag
    {
        return $this->tagRepository->findById($id);
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
        return $this->tagRepository->createTag($userId, $data);
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
        return $this->tagRepository->updateTag($tag, $data);
    }

    /**
     * Delete a tag.
     *
     * @param Tag $tag
     * @return bool
     */
    public function deleteTag(Tag $tag): bool
    {
        return $this->tagRepository->deleteTag($tag);
    }
}
