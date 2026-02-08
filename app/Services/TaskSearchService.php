<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * ============================================================================
 * TaskSearchService
 *
 * Reusable search service for tasks with support for:
 * - Full-text search across multiple fields
 * - Partial and case-insensitive matching
 * - Project and tag filtering
 * - Pagination support
 * - Permission-aware queries
 * ============================================================================
 */
class TaskSearchService
{
    /**
     * Search fields with their weights for relevance ranking
     */
    protected array $searchFields = [
        'title' => 3,        // Higher weight for title matches
        'description' => 2,  // Medium weight for description matches
    ];

    /**
     * Additional fields that can be searched
     */
    protected array $extendedFields = [
        'project_name' => 1,
        'tags' => 1,
    ];

    /**
     * Default pagination settings
     */
    protected int $defaultPerPage = 15;
    protected int $maxPerPage = 100;

    /**
     * Search tasks with query and optional filters
     *
     * @param string|null $query Search query
     * @param array $filters Additional filters (project_id, priority, status, tags, etc.)
     * @param array $options Pagination and sorting options
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function search(?string $query = null, array $filters = [], array $options = [])
    {
        $perPage = min(
            (int) ($options['per_page'] ?? $this->defaultPerPage),
            $this->maxPerPage
        );

        $page = (int) ($options['page'] ?? 1);

        $sortBy = $options['sort_by'] ?? 'relevance';
        $sortOrder = $options['sort_order'] ?? 'desc';

        $baseQuery = $this->buildBaseQuery($query, $filters);

        // Apply sorting
        $baseQuery = $this->applySorting($baseQuery, $sortBy, $sortOrder, $query);

        return $baseQuery->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Quick search for autocomplete/dropdown suggestions
     *
     * @param string|null $query
     * @param array $filters
     * @param int $limit
     * @return Collection
     */
    public function quickSearch(?string $query = null, array $filters = [], int $limit = 10): Collection
    {
        $perPage = min($limit, $this->maxPerPage);

        $baseQuery = $this->buildBaseQuery($query, $filters);

        return $baseQuery->limit($perPage)->get();
    }

    /**
     * Search across all accessible tasks (global search)
     *
     * @param string|null $query
     * @param array $options
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function globalSearch(?string $query = null, array $options = []): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        // Global search uses same logic but without project_id restriction
        return $this->search($query, [], $options);
    }

    /**
     * Build the base query with search and filters
     */
    protected function buildBaseQuery(?string $query, array $filters)
    {
        $taskQuery = Task::where('user_id', Auth::id())
            ->with('tags', 'project')
            ->filter($this->prepareFilters($query, $filters));

        return $taskQuery;
    }

    /**
     * Prepare filters for the query
     */
    protected function prepareFilters(?string $query, array $filters): array
    {
        $prepared = $filters;

        // Add search query to filters (Task model's scopeFilter handles it)
        if ($query !== null && $query !== '') {
            $prepared['search'] = $query;
        }

        return $prepared;
    }

    /**
     * Apply sorting to the query
     */
    protected function applySorting($query, string $sortBy, string $sortOrder, ?string $queryString = null)
    {
        return match ($sortBy) {
            'relevance' => $this->sortByRelevance($query, $queryString, $sortOrder),
            'priority' => $query->orderByPriority()->orderBy('created_at', $sortOrder),
            'due_date' => $query->orderBy('due_date', $sortOrder),
            'created_at' => $query->orderBy('created_at', $sortOrder),
            'title' => $query->orderBy('title', $sortOrder),
            default => $query->orderBy('created_at', 'desc'),
        };
    }

    /**
     * Sort by search relevance (title matches first, then description)
     */
    protected function sortByRelevance($query, ?string $queryString, string $sortOrder)
    {
        if (empty($queryString)) {
            return $query->orderBy('created_at', $sortOrder);
        }

        // Add relevance ordering using CASE statements for MySQL
        $relevanceOrder = "
            CASE
                WHEN title LIKE '{$queryString}%' THEN 1
                WHEN title LIKE '%{$queryString}%' THEN 2
                WHEN description LIKE '%{$queryString}%' THEN 3
                ELSE 4
            END
        ";

        return $query->orderByRaw($relevanceOrder)
            ->orderBy('created_at', $sortOrder);
    }

    /**
     * Get search suggestions based on partial input
     *
     * @param string $partial
     * @param int $limit
     * @return SupportCollection
     */
    public function getSuggestions(string $partial, int $limit = 5): SupportCollection
    {
        return Task::where('user_id', Auth::id())
            ->where('title', 'like', "%{$partial}%")
            ->limit($limit)
            ->pluck('title');
    }

    /**
     * Get search statistics for a query
     *
     * @param string $query
     * @return array
     */
    public function getSearchStats(string $query): array
    {
        $totalMatches = Task::where('user_id', Auth::id())
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->count();

        return [
            'query' => $query,
            'total_matches' => $totalMatches,
        ];
    }

    /**
     * Check if a search query would return results
     *
     * @param string $query
     * @param array $filters
     * @return bool
     */
    public function hasResults(string $query, array $filters = []): bool
    {
        return Task::where('user_id', Auth::id())
            ->where(function ($q) use ($query, $filters) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");

                // Apply additional filters
                if (isset($filters['project_id'])) {
                    $q->where('project_id', $filters['project_id']);
                }
                if (isset($filters['priority'])) {
                    $q->where('priority', $filters['priority']);
                }
                if (isset($filters['is_completed'])) {
                    $q->where('is_completed', $filters['is_completed']);
                }
            })
            ->exists();
    }
}
