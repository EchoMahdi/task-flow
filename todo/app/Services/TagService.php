<?php

namespace App\Services;

use App\Repositories\TagRepositoryInterface;

class TagService
{
    protected $tagRepository;

    public function __construct(TagRepositoryInterface $tagRepository)
    {
        $this->tagRepository = $tagRepository;
    }

    public function getAllTags()
    {
        return $this->tagRepository->getAllTags();
    }

    public function getTag(int $id)
    {
        return $this->tagRepository->getTagById($id);
    }

    public function createTag(array $data)
    {
        return $this->tagRepository->createTag($data);
    }

    public function updateTag(int $id, array $data)
    {
        return $this->tagRepository->updateTag($id, $data);
    }

    public function deleteTag(int $id)
    {
        return $this->tagRepository->deleteTag($id);
    }
}
