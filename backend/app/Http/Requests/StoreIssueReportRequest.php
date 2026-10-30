<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIssueReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'printer_id' => ['required', 'exists:printers,id'],
            'title' => ['required', 'string', 'max:180'],
            'details' => ['required', 'string'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'common_problem_id' => ['nullable', 'exists:printer_common_problems,id'],
        ];
    }
}
