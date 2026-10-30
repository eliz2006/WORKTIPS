<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaintenanceRecordRequest;
use App\Models\MaintenanceRecord;
use App\Models\Printer;
use App\Models\PrinterPart;
use Illuminate\Support\Facades\DB;

class MaintenanceRecordController extends Controller
{
    public function index()
    {
        return MaintenanceRecord::query()
            ->with(['printer:id,name,model', 'technician:id,name', 'parts.part'])
            ->latest('performed_at')
            ->paginate(20);
    }

    public function store(StoreMaintenanceRecordRequest $request)
    {
        $record = DB::transaction(function () use ($request) {
            $printer = Printer::findOrFail($request->integer('printer_id'));
            $nextDue = $request->date('next_due_at')
                ?? now()->addDays($printer->maintenance_interval_days)->toDateString();

            $record = MaintenanceRecord::create([
                ...$request->safe()->except('parts'),
                'performed_by' => $request->user()->id,
                'next_due_at' => $nextDue,
            ]);

            foreach ($request->input('parts', []) as $row) {
                $record->parts()->create($row);
                PrinterPart::whereKey($row['printer_part_id'])->decrement('quantity_on_hand', $row['quantity']);
            }

            $printer->update([
                'last_maintenance_at' => $record->performed_at,
                'next_maintenance_at' => $nextDue,
                'condition' => 'active',
            ]);

            return $record;
        });

        return response()->json($record->load(['printer', 'parts.part']), 201);
    }
}
