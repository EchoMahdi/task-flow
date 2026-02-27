<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Super Admin Only Middleware
 *
 * Restricts access to routes to super admin users only.
 * Uses Spatie's can() method for permission-based authorization.
 *
 * NOTE: Authorization decisions should be based on permissions, not roles.
 * Roles are used for grouping permissions only.
 */
class SuperAdminOnly
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Unauthenticated.');
        }

        // Use permission-based authorization via Spatie
        // This delegates to the Single Source of Truth (Policies + Spatie)
        if (!$user->can('super admin access')) {
            abort(403, 'Only super administrators can access this resource.');
        }

        return $next($request);
    }
}
