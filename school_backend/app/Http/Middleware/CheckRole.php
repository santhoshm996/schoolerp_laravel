<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'status' => 401
            ], 401);
        }

        $userRole = $request->user()->getPrimaryRoleAttribute()->name ?? null;

        if (!$userRole || !in_array($userRole, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Insufficient permissions.',
                'status' => 403
            ], 403);
        }

        return $next($request);
    }
}
