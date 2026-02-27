<?php

namespace App\Http\Requests\Task;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Authorization is handled by the controller using policies.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        // Authorization is handled in TaskController::store() via $this->authorize('create', Task::class)
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', 'string', 'in:low,medium,high'],
            'due_date' => ['nullable', 'date'],
            'project_id' => [
                'nullable',
                'integer',
                // Verify project exists AND belongs to user
                \Illuminate\Validation\Rule::exists('projects', 'id')->where(function ($query) {
                    $query->where('user_id', $this->user()->id);
                })
            ],
            'tags' => ['nullable', 'array'],
            'tags.*' => [
                'integer',
                // Verify tag exists AND belongs to user
                \Illuminate\Validation\Rule::exists('tags', 'id')->where(function ($query) {
                    $query->where('user_id', $this->user()->id);
                })
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'The title field is required.',
            'title.max' => 'The title may not be greater than 255 characters.',
            'priority.in' => 'Priority must be low, medium, or high.',
            'due_date.date' => 'Please enter a valid date.',
            'tags.array' => 'Tags must be an array.',
            'tags.*.exists' => 'One or more tags do not exist or do not belong to you.',
            'project_id.exists' => 'The selected project does not exist or does not belong to you.',
        ];
    }
}
