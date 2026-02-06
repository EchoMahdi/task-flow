<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Task;
use App\Models\Tag;
use App\Models\Project;
use App\Models\SavedView;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class NavigationController extends Controller
{
    /**
     * Get all navigation data for the sidebar
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'system_filters' => $this->getSystemFilters($user),
            'projects' => $this->getProjects($user),
            'favorites' => $this->getFavorites($user),
            'tags' => $this->getTags($user),
            'saved_views' => $this->getSavedViews($user),
            'counts' => $this->getCounts($user),
        ]);
    }

    /**
     * Get system filter counts
     */
    public function counts(Request $request): JsonResponse
    {
        return response()->json([
            'counts' => $this->getCounts($request->user()),
        ]);
    }

    /**
     * Get system filters with counts
     */
    protected function getSystemFilters($user): array
    {
        $now = Carbon::now();

        return [
            [
                'id' => 'inbox',
                'name' => 'Inbox',
                'type' => 'system',
                'filter' => ['project_id' => null, 'is_completed' => false],
                'icon' => 'inbox',
                'count' => Task::where('user_id', $user->id)
                    ->whereNull('project_id')
                    ->where('is_completed', false)
                    ->count(),
            ],
            [
                'id' => 'all_tasks',
                'name' => 'All Tasks',
                'type' => 'system',
                'filter' => [],
                'icon' => 'format_list_bulleted',
                'count' => Task::where('user_id', $user->id)->count(),
            ],
            [
                'id' => 'completed',
                'name' => 'Completed',
                'type' => 'system',
                'filter' => ['is_completed' => true],
                'icon' => 'check_circle',
                'count' => Task::where('user_id', $user->id)
                    ->where('is_completed', true)
                    ->count(),
            ],
            [
                'id' => 'today',
                'name' => 'Today',
                'type' => 'system',
                'filter' => ['due_date' => $now->toDateString(), 'is_completed' => false],
                'icon' => 'today',
                'count' => Task::where('user_id', $user->id)
                    ->whereDate('due_date', $now->toDateString())
                    ->where('is_completed', false)
                    ->count(),
            ],
            [
                'id' => 'overdue',
                'name' => 'Overdue',
                'type' => 'system',
                'filter' => ['due_date' => ['to' => $now->subDay()->toDateString()], 'is_completed' => false],
                'icon' => 'schedule',
                'count' => Task::where('user_id', $user->id)
                    ->whereDate('due_date', '<', $now->toDateString())
                    ->where('is_completed', false)
                    ->count(),
            ],
            [
                'id' => 'upcoming',
                'name' => 'Upcoming',
                'type' => 'system',
                'filter' => ['due_date' => ['from' => $now->addDay()->toDateString()], 'is_completed' => false],
                'icon' => 'date_range',
                'count' => Task::where('user_id', $user->id)
                    ->whereDate('due_date', '>', $now->toDateString())
                    ->where('is_completed', false)
                    ->count(),
            ],
        ];
    }

    /**
     * Get user projects
     */
    protected function getProjects($user): array
    {
        $projects = $user->projects()
            ->withCount(['tasks' => function ($query) {
                $query->where('is_completed', false);
            }])
            ->orderBy('is_favorite', 'desc')
            ->orderBy('name')
            ->get();

        return $projects->map(function ($project) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'color' => $project->color,
                'icon' => $project->icon,
                'is_favorite' => $project->is_favorite,
                'task_count' => $project->tasks_count,
            ];
        })->toArray();
    }

    /**
     * Get favorite projects
     */
    protected function getFavorites($user): array
    {
        $favorites = $user->projects()
            ->favorites()
            ->withCount(['tasks' => function ($query) {
                $query->where('is_completed', false);
            }])
            ->get();

        return $favorites->map(function ($project) {
            return [
                'id' => $project->id,
                'name' => $project->name,
                'color' => $project->color,
                'icon' => $project->icon,
                'task_count' => $project->tasks_count,
            ];
        })->toArray();
    }

    /**
     * Get user tags
     */
    protected function getTags($user): array
    {
        $tags = $user->tags()->withCount('tasks')->get();

        return $tags->map(function ($tag) {
            return [
                'id' => $tag->id,
                'name' => $tag->name,
                'color' => $tag->color,
                'task_count' => $tag->tasks_count,
            ];
        })->toArray();
    }

    /**
     * Get saved views
     */
    protected function getSavedViews($user): array
    {
        $savedViews = $user->savedViews()->get();

        return $savedViews->map(function ($view) {
            return [
                'id' => $view->id,
                'name' => $view->name,
                'icon' => $view->icon,
                'display_mode' => $view->display_mode,
                'filters' => $view->filters,
            ];
        })->toArray();
    }

    /**
     * Get all counts for the navigation
     */
    protected function getCounts($user): array
    {
        $now = Carbon::now();

        return [
            'inbox' => Task::where('user_id', $user->id)
                ->whereNull('project_id')
                ->where('is_completed', false)
                ->count(),
            'all_tasks' => Task::where('user_id', $user->id)->count(),
            'completed' => Task::where('user_id', $user->id)
                ->where('is_completed', true)
                ->count(),
            'today' => Task::where('user_id', $user->id)
                ->whereDate('due_date', $now->toDateString())
                ->where('is_completed', false)
                ->count(),
            'overdue' => Task::where('user_id', $user->id)
                ->whereDate('due_date', '<', $now->toDateString())
                ->where('is_completed', false)
                ->count(),
            'upcoming' => Task::where('user_id', $user->id)
                ->whereDate('due_date', '>', $now->toDateString())
                ->where('is_completed', false)
                ->count(),
            'projects' => Project::where('user_id', $user->id)->count(),
            'tags' => Tag::where('user_id', $user->id)->count(),
            'saved_views' => SavedView::where('user_id', $user->id)->count(),
        ];
    }
}
