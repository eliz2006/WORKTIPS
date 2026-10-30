<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreKnowledgeItemRequest;
use App\Models\ContentReport;
use App\Models\KnowledgeComment;
use App\Models\KnowledgeItem;
use App\Models\KnowledgeMedia;
use App\Models\KnowledgeRating;
use App\Models\SavedItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class KnowledgeItemController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = KnowledgeItem::query()
            ->with(['author:id,name,role', 'category', 'printer:id,name,model', 'media'])
            ->withAvg('ratings', 'score')
            ->withCount('ratings')
            ->with(['saves' => fn ($q) => $q->where('user_id', $user->id)])
            ->search($request->string('q'))
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->string('type')))
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->integer('category_id')))
            ->when($request->boolean('mine'), fn ($q) => $q->where('user_id', $user->id))
            ->when($request->boolean('saved'), fn ($q) => $q->whereHas('saves', fn ($s) => $s->where('user_id', $user->id)))
            ->when(
                $user->isAdmin() && $request->filled('status'),
                fn ($q) => $q->where('status', $request->string('status'))
            )
            ->when(! $user->isAdmin() && ! $request->boolean('mine'), fn ($q) => $q->approved())
            ->latest();

        return $query->paginate(12);
    }

    public function store(StoreKnowledgeItemRequest $request)
    {
        $item = DB::transaction(function () use ($request) {
            $item = KnowledgeItem::create([
                ...$request->safe()->except('media', 'status'),
                'user_id' => $request->user()->id,
                'status' => $request->user()->isAdmin() ? ($request->input('status', 'approved')) : 'pending',
            ]);

            $this->storeMedia($request, $item);

            return $item;
        });

        return response()->json($item->load(['author', 'category', 'media']), 201);
    }

    public function show(Request $request, KnowledgeItem $knowledgeItem)
    {
        $user = $request->user();

        if ($knowledgeItem->status !== 'approved' && ! $user->isAdmin() && $knowledgeItem->user_id !== $user->id) {
            abort(403);
        }

        $knowledgeItem->increment('views');

        return $knowledgeItem->fresh()->load([
            'author:id,name,role',
            'category',
            'printer.inkTypes',
            'media',
            'comments.user:id,name',
        ])->loadAvg('ratings', 'score')->loadCount('ratings');
    }

    public function update(StoreKnowledgeItemRequest $request, KnowledgeItem $knowledgeItem)
    {
        $user = $request->user();
        abort_unless($user->isAdmin() || $knowledgeItem->user_id === $user->id, 403);

        $knowledgeItem->update($request->safe()->except('media', 'status'));
        $this->storeMedia($request, $knowledgeItem);

        if (! $user->isAdmin()) {
            $knowledgeItem->update(['status' => 'pending']);
        }

        return $knowledgeItem->load(['author', 'category', 'media']);
    }

    public function moderate(Request $request, KnowledgeItem $knowledgeItem)
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'rejection_reason' => ['nullable', 'required_if:status,rejected', 'string'],
        ]);

        $knowledgeItem->update([
            ...$data,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return $knowledgeItem;
    }

    public function comment(Request $request, KnowledgeItem $knowledgeItem)
    {
        $data = $request->validate(['body' => ['required', 'string', 'max:2000']]);

        $comment = KnowledgeComment::create([
            'knowledge_item_id' => $knowledgeItem->id,
            'user_id' => $request->user()->id,
            'body' => $data['body'],
        ]);

        return response()->json($comment->load('user:id,name'), 201);
    }

    public function rate(Request $request, KnowledgeItem $knowledgeItem)
    {
        $data = $request->validate(['score' => ['required', 'integer', 'min:1', 'max:5']]);

        $rating = KnowledgeRating::updateOrCreate(
            ['knowledge_item_id' => $knowledgeItem->id, 'user_id' => $request->user()->id],
            ['score' => $data['score']]
        );

        return $rating;
    }

    public function toggleSave(Request $request, KnowledgeItem $knowledgeItem)
    {
        $existing = SavedItem::query()
            ->where('user_id', $request->user()->id)
            ->where('knowledge_item_id', $knowledgeItem->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json(['saved' => false]);
        }

        SavedItem::create([
            'user_id' => $request->user()->id,
            'knowledge_item_id' => $knowledgeItem->id,
        ]);

        return response()->json(['saved' => true]);
    }

    public function report(Request $request, KnowledgeItem $knowledgeItem)
    {
        $data = $request->validate([
            'reason' => ['required', 'in:incorrect,outdated,unsafe,duplicate'],
            'details' => ['nullable', 'string'],
        ]);

        $report = ContentReport::create([
            ...$data,
            'knowledge_item_id' => $knowledgeItem->id,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($report, 201);
    }

    public function reports(Request $request)
    {
        return ContentReport::query()
            ->with(['item:id,title,status', 'reporter:id,name'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate(20);
    }

    public function resolveReport(Request $request, ContentReport $report)
    {
        $report->update([
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return $report;
    }

    public function destroy(Request $request, KnowledgeItem $knowledgeItem)
    {
        abort_unless($request->user()->isAdmin() || $knowledgeItem->user_id === $request->user()->id, 403);
        $knowledgeItem->delete();

        return response()->json(['message' => 'Removed.']);
    }

    private function storeMedia(Request $request, KnowledgeItem $item): void
    {
        foreach ($request->file('media', []) as $file) {
            $path = $file->store('knowledge/'.$item->id, 'public');
            $mime = $file->getMimeType();

            KnowledgeMedia::create([
                'knowledge_item_id' => $item->id,
                'path' => $path,
                'kind' => str_starts_with((string) $mime, 'video') ? 'video' : 'photo',
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $mime,
                'size_bytes' => $file->getSize(),
            ]);

            if (str_starts_with((string) $mime, 'video') && ! $item->video_path) {
                $item->update(['video_path' => Storage::disk('public')->url($path)]);
            }
        }
    }
}
