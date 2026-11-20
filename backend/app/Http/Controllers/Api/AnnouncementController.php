<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /** Everyone signed in can read the latest announcements. */
    public function index()
    {
        return Announcement::with('author:id,name')->latest()->limit(30)->get();
    }

    /** Admin only (see routes/api.php). */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $announcement = Announcement::create([
            'title' => trim($data['title']),
            'body' => trim($data['body']),
            'user_id' => $request->user()->id,
        ]);

        return response()->json($announcement->load('author:id,name'), 201);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->noContent();
    }
}