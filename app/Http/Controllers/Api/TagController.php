<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tag\StoreTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Tag Controller
 *
 * Handles HTTP requests for Tag resources.
 * Authorization is performed via Laravel Policies BEFORE any service calls.
 * User context is explicitly passed to the service layer.
 */
class TagController extends Controller
{
    protected TagService $tagService;

    public function __construct(TagService $tagService)
    {
        $this->tagService = $tagService;
    }

    /**
     * Get all tags for the authenticated user
     *
     * GET /api/tags
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Tag::class);

        $tags = $this->tagService->getAllTagsForUser($request->user()->id);
        
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
        $this->authorize('create', Tag::class);

        $tag = $this->tagService->createTag(
            $request->user()->id,
            $request->validated()
        );
        
        return response()->json([
            'tag' => new TagResource($tag),
            'message' => 'Tag created successfully.',
        ], 201);
    }

    /**
     * Delete a tag
     *
     * DELETE /api/tags/{tag}
     * 
     * Uses Route Model Binding to resolve the Tag.
     * Authorization is handled via TagPolicy BEFORE deletion.
     */
    public function destroy(Request $request, Tag $tag): JsonResponse
    {
        // Authorization check - throws AuthorizationException if denied
        $this->authorize('delete', $tag);
        
        // Authorization passed, proceed with deletion
        $this->tagService->deleteTag($tag);
        
        return response()->json([
            'message' => 'Tag deleted successfully.',
        ]);
    }
}
