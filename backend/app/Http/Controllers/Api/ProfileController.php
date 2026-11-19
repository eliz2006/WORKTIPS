<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /** PUT /api/profile  { name, avatar?: data URL, remove_avatar?: bool } */
    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'avatar' => ['nullable', 'string', 'max:400000'],
            'remove_avatar' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $user->name = trim($data['name']);

        if ($request->boolean('remove_avatar')) {
            $user->avatar_path = null;
        } elseif (! empty($data['avatar'])) {
            $avatar = $data['avatar'];

            if (! preg_match('#^data:image/(png|jpeg|webp);base64,#', $avatar)
                || base64_decode(substr($avatar, strpos($avatar, ',') + 1), true) === false) {
                return response()->json(['message' => 'The photo is not a valid image.'], 422);
            }

            // Stored in the database so it survives server restarts.
            $user->avatar_path = $avatar;
        }

        $user->save();

        return response()->json($user);
    }
}