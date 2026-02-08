<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subtask extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'title',
        'description',
        'is_completed',
        'order',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
    ];

    protected $attributes = [
        'is_completed' => false,
        'order' => 0,
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function markAsCompleted()
    {
        $this->update([
            'is_completed' => true,
        ]);
    }

    public function markAsIncomplete()
    {
        $this->update([
            'is_completed' => false,
        ]);
    }

    public function scopeForTask($query, $taskId)
    {
        return $query->where('task_id', $taskId)->orderBy('order');
    }
}
