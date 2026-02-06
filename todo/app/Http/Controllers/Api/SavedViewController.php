<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SavedViewResource;
use App\Models\SavedView;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SavedViewController extends Controller
{
    /**
     * Get all saved views for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $savedViews = $request->user()
            ->savedViews()
            ->orderBy('name')
            ->get();

        return response()->json([
            'saved_views' => SavedViewResource::collection($savedViews),
        ]);
    }

    /**
     * Get a single saved view
     */
    public function show(Request $request, SavedView $savedView): JsonResponse
    {
        if ($savedView->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'saved_view' => new SavedViewResource($savedView),
        ]);
    }

    /**
     * Create a new saved view
     *
     * POST /api/saved-views
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'filter_conditions' => 'nullable|array',
            'sort_order' => 'nullable|array',
            'display_mode' => 'nullable|string|in:list,calendar,board',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $savedView = $request->user()->savedViews()->create([
            'name' => $request->name,
            'filters' => $request->filter_conditions ?? [],
            'sort_order' => $request->sort_order ?? [],
            'display_mode' => $request->display_mode ?? 'list',
        ]);

        return response()->json([
            'saved_view' => new SavedViewResource($savedView),
            'message' => 'Saved view created successfully',
        ], 201);
    }

    /**
     * Update a saved view
     *
     * PATCH /api/saved-views/{id}
     */
    public function update(Request $request, SavedView $savedView): JsonResponse
    {
        if ($savedView->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'filter_conditions' => 'nullable|array',
            'sort_order' => 'nullable|array',
            'display_mode' => 'nullable|string|in:list,calendar,board',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        
        // Rename filter_conditions to filters for database
        if (isset($validated['filter_conditions'])) {
            $validated['filters'] = $validated['filter_conditions'];
            unset($validated['filter_conditions']);
        }

        $savedView->update($validated);

        return response()->json([
            'saved_view' => new SavedViewResource($savedView),
            'message' => 'Saved view updated successfully',
        ]);
    }

    /**
     * Delete a saved view
     */
    public function destroy(Request $request, SavedView $savedView): JsonResponse
    {
        if ($savedView->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $savedView->delete();

        return response()->json([
            'message' => 'Saved view deleted successfully',
        ]);
    }
}
