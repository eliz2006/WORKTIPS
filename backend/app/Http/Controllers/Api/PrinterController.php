<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrinterRequest;
use App\Models\Printer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrinterController extends Controller
{
    public function index(Request $request)
    {
        return Printer::query()
            ->with(['inkTypes', 'commonProblems'])
            ->withCount(['issueReports as open_issues_count' => fn ($q) => $q->whereNotIn('status', ['resolved', 'closed'])])
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = $request->string('q');
                $q->where(function ($inner) use ($term) {
                    $inner->where('name', 'like', "%{$term}%")
                        ->orWhere('brand', 'like', "%{$term}%")
                        ->orWhere('model', 'like', "%{$term}%")
                        ->orWhere('serial_number', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('condition'), fn ($q) => $q->where('condition', $request->string('condition')))
            ->orderBy('name')
            ->get();
    }

    public function store(StorePrinterRequest $request)
    {
        $printer = DB::transaction(function () use ($request) {
            $printer = Printer::create($request->safe()->except('ink_type_ids', 'common_problems'));
            $printer->inkTypes()->sync($request->input('ink_type_ids', []));
            foreach ($request->input('common_problems', []) as $problem) {
                $printer->commonProblems()->create($problem);
            }

            return $printer;
        });

        return response()->json($printer->load(['inkTypes', 'commonProblems']), 201);
    }

    public function show(Printer $printer)
    {
        return $printer->load([
            'inkTypes',
            'parts',
            'commonProblems',
            'maintenanceRecords.parts.part',
            'issueReports' => fn ($q) => $q->latest()->limit(10),
        ]);
    }

    public function update(StorePrinterRequest $request, Printer $printer)
    {
        DB::transaction(function () use ($request, $printer) {
            $printer->update($request->safe()->except('ink_type_ids', 'common_problems'));
            if ($request->has('ink_type_ids')) {
                $printer->inkTypes()->sync($request->input('ink_type_ids', []));
            }
            if ($request->has('common_problems')) {
                $printer->commonProblems()->delete();
                foreach ($request->input('common_problems', []) as $problem) {
                    $printer->commonProblems()->create($problem);
                }
            }
        });

        return $printer->fresh()->load(['inkTypes', 'commonProblems']);
    }

    public function destroy(Printer $printer)
    {
        $printer->delete();

        return response()->json(['message' => 'Printer archived.']);
    }
}
