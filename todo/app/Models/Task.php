<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'title',
        'description',
        'priority',
        'due_date',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'completed_at' => 'datetime',
        'is_completed' => 'boolean',
    ];

    protected $attributes = [
        'priority' => 'medium',
        'is_completed' => false,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'task_tag')->withTimestamps();
    }

    public function subtasks(): HasMany
    {
        return $this->hasMany(Subtask::class)->orderBy('order');
    }

    /**
     * Get the completion percentage based on subtasks
     */
    public function getSubtaskProgressAttribute(): int
    {
        $total = $this->subtasks()->count();
        if ($total === 0) {
            return 0;
        }
        $completed = $this->subtasks()->where('is_completed', true)->count();
        return (int) round(($completed / $total) * 100);
    }

    /**
     * Check if all subtasks are completed
     */
    public function getAllSubtasksCompletedAttribute(): bool
    {
        return $this->subtasks()->count() > 0 
            && $this->subtasks()->where('is_completed', false)->count() === 0;
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? false, function ($query, $search) {
            $query->where(function ($query) use ($search) {
                $query->where('title', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%');
            });
        });

        $query->when($filters['priority'] ?? false, function ($query, $priority) {
            $query->where('priority', $priority);
        });

        if (isset($filters['is_completed']) && $filters['is_completed'] !== null) {
            $query->where('is_completed', (bool) $filters['is_completed']);
        }

        $query->when($filters['tag_id'] ?? false, function ($query, $tagId) {
            $query->whereHas('tags', function ($query) use ($tagId) {
                $query->where('id', $tagId);
            });
        });

        $query->when($filters['project_id'] ?? false, function ($query, $projectId) {
            if ($projectId === 'null') {
                $query->whereNull('project_id');
            } else {
                $query->where('project_id', (int) $projectId);
            }
        });

        $query->when($filters['due_date'] ?? false, function ($query, $dateFilter) {
            if (is_array($dateFilter)) {
                if (isset($dateFilter['from'])) {
                    $query->whereDate('due_date', '>=', $dateFilter['from']);
                }
                if (isset($dateFilter['to'])) {
                    $query->whereDate('due_date', '<=', $dateFilter['to']);
                }
            } else {
                $query->whereDate('due_date', $dateFilter);
            }
        });
    }

    public function scopeOrderByPriority($query)
    {
        $priorityOrder = ['high' => 1, 'medium' => 2, 'low' => 3];
        return $query->orderByRaw("CASE WHEN priority = 'high' THEN 1 WHEN priority = 'medium' THEN 2 ELSE 3 END");
    }

    public function markAsCompleted()
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);
    }

    public function markAsIncomplete()
    {
        $this->update([
            'is_completed' => false,
            'completed_at' => null,
        ]);
    }
}
