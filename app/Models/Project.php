<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'team_id',
        'name',
        'color',
        'icon',
        'is_favorite',
        'is_archived',
        'archived_at',
        'parent_id',
    ];

    protected $casts = [
        'color' => 'string',
        'is_favorite' => 'boolean',
        'is_archived' => 'boolean',
        'archived_at' => 'datetime',
    ];

    protected $attributes = [
        'color' => '#3B82F6',
        'icon' => 'folder',
        'is_favorite' => false,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Project::class, 'parent_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get the task count for this project
     */
    public function getTaskCountAttribute(): int
    {
        return $this->tasks()->where('is_completed', false)->count();
    }

    /**
     * Get all descendant projects
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Scope for favorite projects
     */
    public function scopeFavorites($query)
    {
        return $query->where('is_favorite', true);
    }

    /**
     * Scope for root projects (no parent)
     */
    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope for active (non-archived) projects
     */
    public function scopeActive($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('archived_at')
              ->orWhere('archived_at', '=', null);
        });
    }

    /**
     * Scope for archived projects
     */
    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at')
                     ->where('archived_at', '!=', null);
    }

    /**
     * Check if project is archived
     */
    public function isArchived(): bool
    {
        return !is_null($this->archived_at);
    }

    /**
     * Archive the project
     */
    public function archive(): bool
    {
        return $this->update([
            'archived_at' => now(),
            'is_archived' => true,
        ]);
    }

    /**
     * Restore the project from archive
     */
    public function restore(): bool
    {
        return $this->update([
            'archived_at' => null,
            'is_archived' => false,
        ]);
    }
}
