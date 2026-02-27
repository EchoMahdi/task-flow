<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Permission Middleware
 *
 * Middleware for checking permissions on routes.
 * Uses Spatie's laravel-permission for authorization.
 * 
 * NOTE: For resource-based authorization with context (e.g., checking if user
 * can edit a specific task), use Laravel Policies in controllers via $this->authorize().
 * This middleware is for simple permission checks without resource context.
 * 
 * Usage with scopes (optional):
 *   Route::get('/tasks/{task}', ...)->middleware('permission:task.view task');
 *   This will check 'task.view' permission with {task} as the resource context.
 */
class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param string $permission
     * @param string|null ...$scopes Optional resource scopes for context-based auth
     * @return Response
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function handle(Request $request, Closure $next, string $permission, ?string ...$scopes): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // Build context from route parameters if scopes are provided
        $context = $this->buildContext($request, $scopes);

        // Use Spatie's can() method for permission checking
        // Supports both simple permission and resource-based permission checks
        if ($context) {
            if (!$user->can($permission, $context)) {
                abort(403, 'You do not have permission to access this resource.');
            }
        } else {
            if (!$user->can($permission)) {
                abort(403, 'You do not have permission to access this resource.');
            }
        }

        return $next($request);
    }

    /**
     * Build permission context from request.
     *
     * @param Request $request
     * @param array $scopes
     * @return mixed
     */
    protected function buildContext(Request $request, array $scopes): mixed
    {
        if (empty($scopes)) {
            return null;
        }

        // If scope is specified, extract from route parameters
        foreach ($scopes as $scope) {
            $scopeId = $request->route($scope) ?? $request->input("{$scope}_id");
            
            if ($scopeId) {
                return is_object($scopeId) ? $scopeId : $scopeId;
            }
        }

        return null;
    }
}
