<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Restreint une route à certains rôles : ->middleware('role:admin,manager')
 * L'admin passe toujours.
 */
class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Ce compte est désactivé.'], 403);
        }

        if ($user->hasRole('admin') || $user->hasRole(...$roles)) {
            return $next($request);
        }

        return response()->json(['message' => 'Accès refusé : droits insuffisants.'], 403);
    }
}
