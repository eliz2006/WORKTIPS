<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePrinterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $id = $this->route('printer')?->id;

        return [
            'name' => ['required', 'string', 'max:120'],
            'brand' => ['required', 'string', 'max:80'],
            'model' => ['required', 'string', 'max:80'],
            'type' => ['required', 'in:inkjet,laser,sublimation,digital,eco_solvent,uv'],
            'serial_number' => ['required', 'string', 'max:80', Rule::unique('printers', 'serial_number')->ignore($id)],
            'printing_category' => ['required', 'in:tarpaulin,sticker,sublimation,digital,other'],
            'condition' => ['required', 'in:active,maintenance,inactive,retired'],
            'maintenance_interval_days' => ['required', 'integer', 'min:1', 'max:365'],
            'last_maintenance_at' => ['nullable', 'date'],
            'next_maintenance_at' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
            'ink_type_ids' => ['nullable', 'array'],
            'ink_type_ids.*' => ['exists:ink_types,id'],
            'common_problems' => ['nullable', 'array'],
            'common_problems.*.title' => ['required_with:common_problems', 'string', 'max:180'],
            'common_problems.*.description' => ['nullable', 'string'],
            'common_problems.*.recommended_solution' => ['required_with:common_problems', 'string'],
        ];
    }
}
