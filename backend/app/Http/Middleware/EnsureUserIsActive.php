<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->status !== 'active') {
            $user->tokens()->delete();

            return response()->json(['message' => 'Your account is not active.'], 403);
        }

        return $next($request);
    }
}