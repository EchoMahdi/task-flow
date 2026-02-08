<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'filters',
        'sort_order',
        'display_mode',
        'icon',
        'is_default',
    ];

    protected $casts = [
        'filters' => 'array',
        'sort_order' => 'array',
        'is_default' => 'boolean',
    ];

    protected $attributes = [
        'display_mode' => 'list',
        'is_default' => false,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Apply filters to a task query
     */
    public function applyToQuery($query)
    {
        $query->when($this->filters['search'] ?? false, function ($q, $search) {
            $q->where(function ($query) use ($search) {
                $query->where('title', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        });

        $query->when($this->filters['priority'] ?? false, function ($q, $priority) {
            $q->where('priority', $priority);
        });

        $query->when($this->filters['is_completed'] ?? false, function ($q, $isCompleted) {
            $q->where('is_completed', $isCompleted);
        });

        $query->when($this->filters['tag_id'] ?? false, function ($q, $tagId) {
            $q->whereHas('tags', function ($query) use ($tagId) {
                $query->where('id', $tagId);
            });
        });

        $query->when($this->filters['project_id'] ?? false, function ($q, $projectId) {
            $q->where('project_id', $projectId);
        });

        $query->when($this->filters['due_date'] ?? false, function ($q, $dateFilter) {
            if (isset($dateFilter['from'])) {
                $q->whereDate('due_date', '>=', $dateFilter['from']);
            }
            if (isset($dateFilter['to'])) {
                $q->whereDate('due_date', '<=', $dateFilter['to']);
            }
        });

        // Apply sorting
        if ($this->sort_order['field'] ?? false) {
            $direction = $this->sort_order['direction'] ?? 'asc';
            $query->orderBy($this->sort_order['field'], $direction);
        }
    }

    /**
     * Scope for default views
     */
    public function scopeDefaults($query)
    {
        return $query->where('is_default', true);
    }
}
