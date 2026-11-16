<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DenyRecipientWrites
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $allowedWrites = $request->is('api/logout') || ($request->is('api/me') && $request->isMethod('PATCH'));

        if ($user?->isRecipient() && ! $request->isMethod('GET') && ! $allowedWrites) {
            return response()->json([
                'message' => 'Recipient accounts can view the workspace but cannot create or change records.',
            ], 403);
        }

        return $next($request);
    }
}
