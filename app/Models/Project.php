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
        'name',
        'color',
        'icon',
        'is_favorite',
        'parent_id',
    ];

    protected $casts = [
        'color' => 'string',
        'is_favorite' => 'boolean',
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
}
