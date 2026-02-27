<?php

namespace App\Http\Requests\Role;

use App\Models\Permission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Sync Role Permissions Request
 *
 * Validates input for syncing permissions to a role.
 * Includes hierarchy validation to prevent privilege escalation.
 */
class SyncRolePermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('roles.update');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'permissions' => ['required', 'array'],
            'permissions.*' => [
                'string',
                Rule::exists('permissions', 'key'),
            ],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Adds hierarchy validation to ensure users cannot assign
     * permissions that exceed their authority level.
     *
     * @param \Illuminate\Validation\Validator $validator
     * @return void
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $userLevel = $this->user()->getPermissionLevel();
            $requestedPermissions = $this->input('permissions', []);
            
            // Get permissions from database by keys
            $permissions = Permission::whereIn('key', $requestedPermissions)->get();
            
            foreach ($permissions as $permission) {
                $permissionLevel = (int) $permission->level;
                
                if ($permissionLevel > $userLevel) {
                    $validator->errors()->add(
                        'permissions',
                        "Permission '{$permission->key}' exceeds your authority level."
                    );
                }
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'permissions.required' => 'Permissions are required.',
            'permissions.array' => 'Permissions must be provided as an array.',
            'permissions.*.exists' => 'One or more permissions are invalid.',
        ];
    }
}