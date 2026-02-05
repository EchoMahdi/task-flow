<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'task_tag')->withTimestamps();
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

        $query->when($filters['due_date'] ?? false, function ($query, $date) {
            $query->whereDate('due_date', $date);
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
