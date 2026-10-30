<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInkConsumptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'ink_type_id' => ['required', 'exists:ink_types,id'],
            'printer_id' => ['required', 'exists:printers,id'],
            'printing_job_id' => ['nullable', 'exists:printing_jobs,id'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'unit' => ['required', 'in:ml,L'],
            'consumed_on' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
