<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInkConsumptionRequest;
use App\Models\InkConsumption;
use App\Models\InkType;
use Illuminate\Http\Request;

class InkConsumptionController extends Controller
{
    public function index(Request $request)
    {
        return InkConsumption::query()
            ->with(['inkType', 'printer:id,name,model', 'printingJob:id,job_number,printing_type,product_name'])
            ->when($request->filled('printer_id'), fn ($q) => $q->where('printer_id', $request->integer('printer_id')))
            ->latest('consumed_on')
            ->paginate(25);
    }

    public function store(StoreInkConsumptionRequest $request)
    {
        $row = InkConsumption::create([
            ...$request->validated(),
            'recorded_by' => $request->user()->id,
        ]);

        return response()->json($row->load(['inkType', 'printer']), 201);
    }

    public function types()
    {
        return InkType::query()->orderBy('brand')->orderBy('color')->get();
    }

    public function storeType(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:80'],
            'color' => ['required', 'string', 'max:40'],
            'brand' => ['required', 'string', 'max:80'],
            'formula' => ['required', 'in:dye,pigment,sublimation,uv,solvent'],
            'unit' => ['required', 'in:ml,L'],
            'low_stock_threshold' => ['nullable', 'numeric'],
            'notes' => ['nullable', 'string'],
        ]);

        return response()->json(InkType::create($data), 201);
    }
}
