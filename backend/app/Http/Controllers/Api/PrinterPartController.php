<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrinterPartRequest;
use App\Models\PrinterPart;

class PrinterPartController extends Controller
{
    public function index()
    {
        return PrinterPart::query()->with('printers:id,name,model')->orderBy('name')->get();
    }

    public function store(StorePrinterPartRequest $request)
    {
        $part = PrinterPart::create($request->safe()->except('printer_ids'));
        $part->printers()->sync($request->input('printer_ids', []));

        return response()->json($part->load('printers'), 201);
    }

    public function update(StorePrinterPartRequest $request, PrinterPart $part)
    {
        $part->update($request->safe()->except('printer_ids'));
        if ($request->has('printer_ids')) {
            $part->printers()->sync($request->input('printer_ids', []));
        }

        return $part->load('printers');
    }

    public function destroy(PrinterPart $part)
    {
        $part->delete();

        return response()->json(['message' => 'Part removed.']);
    }
}
