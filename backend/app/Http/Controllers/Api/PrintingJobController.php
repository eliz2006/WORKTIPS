<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrintingJobRequest;
use App\Models\InkConsumption;
use App\Models\PrintingJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrintingJobController extends Controller
{
    public function index(Request $request)
    {
        return PrintingJob::query()
            ->with(['printer:id,name,model', 'seller:id,name'])
            ->when($request->filled('printing_type'), fn ($q) => $q->where('printing_type', $request->string('printing_type')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('job_date', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('job_date', '<=', $request->date('to')))
            ->latest('job_date')
            ->paginate(20);
    }

    public function store(StorePrintingJobRequest $request)
    {
        $job = DB::transaction(function () use ($request) {
            $job = PrintingJob::create([
                ...$request->safe()->except('ink'),
                'sold_by' => $request->user()->id,
            ]);

            if ($job->printer_id) {
                foreach ($request->input('ink', []) as $row) {
                    InkConsumption::create([
                        'ink_type_id' => $row['ink_type_id'],
                        'printer_id' => $job->printer_id,
                        'printing_job_id' => $job->id,
                        'recorded_by' => $request->user()->id,
                        'quantity' => $row['quantity'],
                        'unit' => $row['unit'] ?? 'ml',
                        'consumed_on' => $job->job_date,
                    ]);
                }
            }

            return $job;
        });

        return response()->json($job->load(['printer', 'inkConsumptions.inkType']), 201);
    }

    public function update(StorePrintingJobRequest $request, PrintingJob $printingJob)
    {
        abort_unless($request->user()->isAdmin() || $printingJob->sold_by === $request->user()->id, 403);
        $printingJob->update($request->safe()->except('ink'));

        return $printingJob->fresh()->load(['printer', 'seller']);
    }

    public function destroy(Request $request, PrintingJob $printingJob)
    {
        abort_unless($request->user()->isAdmin(), 403);
        $printingJob->delete();

        return response()->json(['message' => 'Job deleted.']);
    }
}
