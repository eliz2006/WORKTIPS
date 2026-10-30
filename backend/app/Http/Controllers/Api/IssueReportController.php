<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIssueReportRequest;
use App\Models\IssueReport;
use App\Models\Printer;
use App\Models\PrinterCommonProblem;
use Illuminate\Http\Request;

class IssueReportController extends Controller
{
    public function index(Request $request)
    {
        $query = IssueReport::query()
            ->with(['printer:id,name,model,condition', 'reporter:id,name', 'assignee:id,name'])
            ->when(! $request->user()->isAdmin(), fn ($q) => $q->where('user_id', $request->user()->id))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest();

        return $query->paginate(20);
    }

    public function store(StoreIssueReportRequest $request)
    {
        $solution = null;
        $commonId = $request->integer('common_problem_id') ?: null;

        if ($commonId) {
            $problem = PrinterCommonProblem::find($commonId);
            $solution = $problem?->recommended_solution;
        } else {
            $problem = PrinterCommonProblem::query()
                ->where('printer_id', $request->integer('printer_id'))
                ->where('title', 'like', '%'.$request->string('title').'%')
                ->first();
            $commonId = $problem?->id;
            $solution = $problem?->recommended_solution;
        }

        $issue = IssueReport::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
            'common_problem_id' => $commonId,
            'recommended_solution' => $solution,
            'status' => 'open',
        ]);

        return response()->json($issue->load(['printer', 'reporter']), 201);
    }

    public function show(Request $request, IssueReport $issue)
    {
        abort_unless($request->user()->isAdmin() || $issue->user_id === $request->user()->id, 403);

        return $issue->load(['printer.commonProblems', 'reporter', 'assignee', 'commonProblem']);
    }

    public function update(Request $request, IssueReport $issue)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $data = $request->validate([
            'status' => ['sometimes', 'in:open,in_progress,resolved,closed'],
            'priority' => ['sometimes', 'in:low,medium,high,critical'],
            'recommended_solution' => ['nullable', 'string'],
            'admin_notes' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        if (($data['status'] ?? null) === 'resolved') {
            $data['resolved_at'] = now();
        }

        $issue->update($data);

        return $issue->fresh()->load(['printer', 'reporter', 'assignee']);
    }

    public function suggestedSolutions(Printer $printer)
    {
        return $printer->commonProblems()->get();
    }
}
