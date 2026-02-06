<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\StoreTagRequest;
use App\Http\Resources\TagResource;
use App\Services\TagService;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    protected $tagService;

    public function __construct(TagService $tagService)
    {
        $this->tagService = $tagService;
    }

    /**
     * Get all tags for the authenticated user
     *
     * GET /api/tags
     */
    public function index(): JsonResponse
    {
        $tags = $this->tagService->getAllTags();
        
        return response()->json([
            'tags' => TagResource::collection($tags),
        ]);
    }

    /**
     * Create a new tag
     *
     * POST /api/tags
     * Input: { name, color }
     */
    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = $this->tagService->createTag($request->validated());
        
        return response()->json([
            'tag' => new TagResource($tag),
            'message' => 'Tag created successfully.',
        ], 201);
    }

    /**
     * Delete a tag
     *
     * DELETE /api/tags/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $this->tagService->deleteTag($id);
        
        return response()->json([
            'message' => 'Tag deleted successfully.',
        ]);
    }
}
