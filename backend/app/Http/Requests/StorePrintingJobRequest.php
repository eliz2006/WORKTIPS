<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrintingJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        if ($this->printer_id === '') {
            $this->merge(['printer_id' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'printer_id' => ['nullable', 'exists:printers,id'],
            'customer_name' => ['nullable', 'string', 'max:120'],
            'printing_type' => ['required', 'in:tarpaulin,sticker,sublimation,digital,other'],
            'product_name' => ['required', 'string', 'max:180'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'job_date' => ['required', 'date'],
            'status' => ['sometimes', 'in:pending,completed,cancelled'],
            'notes' => ['nullable', 'string'],
            'ink' => ['nullable', 'array'],
            'ink.*.ink_type_id' => ['required_with:ink', 'exists:ink_types,id'],
            'ink.*.quantity' => ['required_with:ink', 'numeric', 'min:0.001'],
            'ink.*.unit' => ['nullable', 'in:ml,L'],
        ];
    }
}
