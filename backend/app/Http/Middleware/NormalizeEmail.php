<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Met le champ « email » en minuscules : PostgreSQL compare les textes en tenant compte
 * de la casse, « Awa@Gmail.com » et « awa@gmail.com » doivent pourtant désigner le même compte.
 */
class NormalizeEmail
{
    public function handle(Request $request, Closure $next): Response
    {
        if (is_string($request->input('email'))) {
            $request->merge(['email' => mb_strtolower(trim($request->input('email')))]);
        }

        return $next($request);
    }
}
