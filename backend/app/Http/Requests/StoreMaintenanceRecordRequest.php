<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'printer_id' => ['required', 'exists:printers,id'],
            'performed_at' => ['required', 'date'],
            'work_type' => ['required', 'in:routine,repair,cleaning,parts_replacement,inspection'],
            'notes' => ['nullable', 'string'],
            'labor_cost' => ['nullable', 'numeric', 'min:0'],
            'next_due_at' => ['nullable', 'date'],
            'parts' => ['nullable', 'array'],
            'parts.*.printer_part_id' => ['required_with:parts', 'exists:printer_parts,id'],
            'parts.*.quantity' => ['required_with:parts', 'integer', 'min:1'],
        ];
    }
}
