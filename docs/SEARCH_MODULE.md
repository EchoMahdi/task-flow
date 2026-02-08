# Task Search Module

Production-ready, reusable search architecture for the Task Management application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  SearchInput    │  │  useTaskSearch   │  │ TaskFilters  │  │
│  │  (Component)    │  │  (Hook)          │  │ (Component)  │  │
│  └────────┬────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                   │                     │          │
│           └───────────────────┼─────────────────────┘          │
│                               ▼                               │
│              ┌────────────────────────────────┐               │
│              │   taskSearchService (API Layer) │               │
│              └───────────────┬────────────────┘               │
└──────────────────────────────┼────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              TaskController::search()                   │    │
│  │                   GET /api/tasks/search                │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              TaskSearchService                         │    │
│  │  - Query building                                     │    │
│  │  - Filter application                                 │    │
│  │  - Pagination                                        │    │
│  │  - Sorting (relevance, priority, date)               │    │
│  └─────────────────────────┬───────────────────────────────┘    │
│                            ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Task Model                          │    │
│  │  - scopeFilter()                                      │    │
│  │  - Searchable fields: title, description              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Implementation

### API Endpoints

#### 1. Full Search (Paginated)
```
GET /api/tasks/search
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | No | Search query string |
| `project_id` | int | No | Filter by project |
| `priority` | string | No | Filter by priority (low, medium, high) |
| `is_completed` | bool | No | Filter by completion status |
| `tag_id` | int | No | Filter by tag |
| `page` | int | No | Page number (default: 1) |
| `per_page` | int | No | Items per page (default: 15, max: 100) |
| `sort_by` | string | No | Sort field (relevance, priority, due_date, created_at, title) |
| `sort_order` | string | No | Sort order (asc, desc) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Task title",
      "description": "Task description",
      "priority": "high",
      "due_date": "2024-01-15T10:00:00Z",
      "is_completed": false,
      "tags": [...]
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 75,
    "query": "search term",
    "filters_applied": ["priority", "project_id"]
  }
}
```

#### 2. Quick Search (Autocomplete)
```
GET /api/tasks/search/quick?q=query&limit=10
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "query": "search term",
    "limit": 10,
    "count": 5
  }
}
```

#### 3. Search Suggestions
```
GET /api/tasks/search/suggestions?q=partial
```

**Response:**
```json
{
  "suggestions": ["task 1", "task 2", "task 3"]
}
```

### TaskSearchService

Location: `app/Services/TaskSearchService.php`

**Key Methods:**

| Method | Description |
|--------|-------------|
| `search($query, $filters, $options)` | Full search with pagination |
| `quickSearch($query, $filters, $limit)` | Lightweight search for autocomplete |
| `globalSearch($query, $options)` | Search across all accessible tasks |
| `getSuggestions($partial, $limit)` | Get title suggestions |
| `hasResults($query, $filters)` | Check if query returns results |

### Task Model Search Scope

The `Task` model includes a `scopeFilter()` that handles search:

```php
// In Task.php
public function scopeFilter($query, array $filters)
{
    $query->when($filters['search'] ?? false, function ($query, $search) {
        $query->where(function ($query) use ($search) {
            $query->where('title', 'like', '%'.$search.'%')
                ->orWhere('description', 'like', '%'.$search.'%');
        });
    });
    
    // Additional filters...
}
```

## Frontend Implementation

### useTaskSearch Hook

Location: `frontend/src/hooks/useTaskSearch.js`

**Usage:**

```jsx
import useTaskSearch from '@/hooks/useTaskSearch';

function MyComponent() {
  const {
    query,
    results,
    loading,
    error,
    empty,
    total,
    suggestions,
    pagination,
    setQuery,
    clearSearch,
    updateFilters,
    goToPage,
    refresh,
  } = useTaskSearch({
    debounceMs: 300,        // Debounce delay
    initialLimit: 10,        // Quick search limit
    autoSearch: false,      // Search on mount
    defaultFilters: {},      // Default filters
  });
  
  // Use the hook...
}
```

**Hook State:**

| State | Type | Description |
|-------|------|-------------|
| `query` | string | Current search query |
| `results` | array | Search results |
| `loading` | boolean | Loading state |
| `error` | string | Error message |
| `empty` | boolean | No results found |
| `total` | number | Total result count |
| `suggestions` | array | Autocomplete suggestions |
| `pagination` | object | Pagination info |

**Hook Methods:**

| Method | Description |
|--------|-------------|
| `setQuery(value)` | Set query with debouncing |
| `fetchSuggestions(value)` | Fetch autocomplete suggestions |
| `updateFilters(filters)` | Update filters and refetch |
| `clearSearch()` | Clear search and reset |
| `goToPage(page)` | Navigate to page |
| `refresh()` | Refresh current search |

### SearchInput Component

Location: `frontend/src/components/ui/SearchInput.jsx`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | - | Current value |
| `onChange` | function | - | Change callback |
| `onSubmit` | function | - | Submit callback |
| `onClear` | function | - | Clear callback |
| `placeholder` | string | 'Search...' | Placeholder text |
| `loading` | boolean | false | Show loading |
| `suggestions` | array | [] | Suggestion list |
| `showSuggestions` | boolean | false | Show dropdown |
| `size` | string | 'medium' | Size variant |
| `fullWidth` | boolean | true | Full width |

**Accessibility Features:**

- Full ARIA labels and roles
- Keyboard navigation (Enter to submit, Escape to blur)
- Focus management
- Screen reader support
- Keyboard shortcut hint (/)
- Loading indicator
- Clear button

### TaskSearchService

Location: `frontend/src/services/taskSearchService.js`

**Methods:**

```javascript
// Full search
await taskSearchService.search({
  q: 'query',
  project_id: 1,
  priority: 'high',
  per_page: 15,
});

// Quick search
await taskSearchService.quickSearch('query', 10, 1);

// Suggestions
await taskSearchService.suggestions('partial');

// Check results exist
await taskSearchService.hasResults('query', { project_id: 1 });
```

## Integration Points

### Header Search (Global Search)

```jsx
// In HeaderToolbar/index.jsx
<SearchSection />
```

The header search provides global search across all tasks with quick results dropdown.

### Task List Page

```jsx
// In TaskList page
const searchParams = new URLSearchParams(location.search);
const initialSearch = searchParams.get('search') || '';

const { results, loading } = useTaskSearch({
  query: initialSearch,
  autoSearch: true,
});
```

### Task Filters

The `TaskFilters` component integrates with the search hook for real backend filtering.

## Performance Considerations

1. **Debouncing**: 300ms default delay prevents request flooding
2. **Request Cancellation**: AbortController cancels stale requests
3. **Caching**: Responses can be cached for repeated searches
4. **Pagination**: Default 15 items per page, max 100
5. **Quick Search**: Lightweight endpoint for autocomplete

## Security

- All endpoints require authentication (`auth:sanctum` middleware)
- Users only see their own tasks (filtered by `user_id`)
- Input validation on all endpoints
- SQL injection prevention via Laravel's query builder

## Extensibility

### Adding New Search Fields

1. **Backend**: Update `TaskSearchService`:
```php
protected array $searchFields = [
    'title' => 3,
    'description' => 2,
    'new_field' => 1,
];
```

2. **Frontend**: Update hook if needed for special handling

### Adding New Filters

1. Add to controller validation
2. Add to TaskSearchService filters
3. Update frontend hook options

### Saved Searches

Future enhancement: Store search configurations in `saved_views` table for user-specific saved searches.

## Testing Checklist

- [ ] Search returns correct tasks from database
- [ ] Case-insensitive matching works
- [ ] Partial matches work (e.g., "proj" matches "project")
- [ ] Pagination works correctly
- [ ] Filters combine with search
- [ ] Debouncing prevents request flooding
- [ ] Request cancellation works on query change
- [ ] Loading indicator shows correctly
- [ ] Empty state displays when no results
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Accessibility focus management
- [ ] Search works across different pages/views
- [ ] No UI flicker during search
- [ ] User permissions enforced (only own tasks visible)
