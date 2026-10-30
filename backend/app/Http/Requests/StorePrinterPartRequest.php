<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePrinterPartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $id = $this->route('part')?->id ?? $this->route('printer_part')?->id;

        return [
            'name' => ['required', 'string', 'max:120'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('printer_parts', 'sku')->ignore($id)],
            'part_type' => ['required', 'in:printhead,ink_tank,cartridge,pump,maintenance_box,capping_station,wiper_blade,rollers,dampers,encoder_strip,waste_ink_system,other'],
            'quantity_on_hand' => ['required', 'integer', 'min:0'],
            'condition' => ['required', 'in:good,fair,low_stock,needs_replacement'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'reorder_level' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'printer_ids' => ['nullable', 'array'],
            'printer_ids.*' => ['exists:printers,id'],
        ];
    }
}
