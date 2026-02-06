<?php

namespace App\Http\Requests\Tag;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreTagRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = Auth::id();
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                "unique:tags,name,NULL,id,user_id,{$userId}"
            ],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            'name.max' => 'The name may not be greater than 255 characters.',
            'name.unique' => 'A tag with this name already exists.',
            'color.regex' => 'The color must be a valid hex color code.',
        ];
    }
}
