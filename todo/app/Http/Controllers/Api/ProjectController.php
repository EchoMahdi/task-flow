<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    /**
     * Get all projects for the authenticated user
     *
     * GET /api/projects
     * Returns: { favorites: [], other: [] }
     */
    public function index(Request $request): JsonResponse
    {
        $projects = $request->user()
            ->projects()
            ->withCount(['tasks' => function ($query) {
                $query->where('is_completed', false);
            }])
            ->orderBy('is_favorite', 'desc')
            ->orderBy('name')
            ->get();

        $favorites = $projects->where('is_favorite', true);
        $other = $projects->where('is_favorite', false);

        return response()->json([
            'favorites' => ProjectResource::collection($favorites),
            'other' => ProjectResource::collection($other),
        ]);
    }

    /**
     * Create a new project
     *
     * POST /api/projects
     * Input: { name, icon, color }
     * Validation: name required, unique per user
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:projects,name,NULL,id,user_id,' . $request->user()->id,
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project = $request->user()->projects()->create([
            'name' => $request->name,
            'icon' => $request->icon ?? 'folder',
            'color' => $request->color ?? '#3B82F6',
            'is_favorite' => false,
        ]);

        $project->loadCount(['tasks' => function ($query) {
            $query->where('is_completed', false);
        }]);

        return response()->json([
            'project' => new ProjectResource($project),
            'message' => 'Project created successfully',
        ], 201);
    }

    /**
     * Update favorite status
     *
     * PATCH /api/projects/{id}/favorite
     * Input: { is_favorite: bool }
     */
    public function updateFavorite(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_favorite' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $project->update([
            'is_favorite' => $request->is_favorite,
        ]);

        return response()->json([
            'project' => new ProjectResource($project),
            'message' => 'Project favorite status updated',
        ]);
    }

    /**
     * Delete a project
     *
     * DELETE /api/projects/{id}
     */
    public function destroy(Request $request, Project $project): JsonResponse
    {
        // Check ownership
        if ($project->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ]);
    }
}
