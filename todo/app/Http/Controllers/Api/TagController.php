<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\StoreTagRequest;
use App\Http\Requests\Tag\UpdateTagRequest;
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

    public function index(): JsonResponse
    {
        $tags = $this->tagService->getAllTags();
        
        return response()->json([
            'data' => TagResource::collection($tags),
        ]);
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = $this->tagService->createTag($request->validated());
        
        return response()->json([
            'message' => 'Tag created successfully.',
            'data' => new TagResource($tag),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $tag = $this->tagService->getTag($id);
        
        return response()->json([
            'data' => new TagResource($tag),
        ]);
    }

    public function update(UpdateTagRequest $request, int $id): JsonResponse
    {
        $tag = $this->tagService->updateTag($id, $request->validated());
        
        return response()->json([
            'message' => 'Tag updated successfully.',
            'data' => new TagResource($tag),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->tagService->deleteTag($id);
        
        return response()->json([
            'message' => 'Tag deleted successfully.',
        ]);
    }
}
