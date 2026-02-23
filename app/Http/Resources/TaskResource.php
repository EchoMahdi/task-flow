<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'due_date' => $this->due_date?->toIso8601String(),
            'is_completed' => $this->is_completed,
            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'project_id' => $this->project_id,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'subtasks_count' => $this->whenCounted('subtasks'),
            'subtask_progress' => $this->when(
                $this->relationLoaded('subtasks') || ($this->subtasks_count ?? 0) > 0,
                fn() => $this->subtask_progress
            ),
        ];
    }
}
