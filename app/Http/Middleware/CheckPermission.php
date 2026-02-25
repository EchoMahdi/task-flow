<?php

namespace App\Http\Middleware;

use App\Facades\Authorization;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Permission Middleware
 *
 * Middleware for checking permissions on routes.
 * Uses the Authorization facade to evaluate permissions.
 */
class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @param string $permission
     * @param mixed ...$scopes
     * @return Response
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function handle(Request $request, Closure $next, string $permission, ...$scopes): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // Build context from route parameters
        $context = $this->buildContext($request, $scopes);

        if (!Authorization::can($user, $permission, $context)) {
            abort(403, 'You do not have permission to access this resource.');
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

        // If scope is specified, extract from route
        foreach ($scopes as $scope) {
            $scopeId = $request->route($scope) ?? $request->input("{$scope}_id");
            
            if ($scopeId) {
                return \App\Authorization\DTOs\PermissionContext::forScope(
                    '', // Permission is set by middleware
                    $request->user(),
                    $scope,
                    is_object($scopeId) ? $scopeId->id : $scopeId
                );
            }
        }

        return null;
    }
}