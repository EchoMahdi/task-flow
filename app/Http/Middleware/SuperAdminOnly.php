<?php

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Super Admin Only Middleware
 *
 * Restricts access to routes to super admin users only.
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

        if (!$user->hasRole(Role::ROLE_SUPER_ADMIN)) {
            abort(403, 'Only super administrators can access this resource.');
        }

        return $next($request);
    }
}