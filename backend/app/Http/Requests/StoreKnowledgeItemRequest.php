<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKnowledgeItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'type' => ['required', 'in:tutorial,documentation,troubleshooting,procedure,tip'],
            'body' => ['required', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'printer_id' => ['nullable', 'exists:printers,id'],
            'status' => ['sometimes', 'in:pending,approved'],
            'media' => ['nullable', 'array', 'max:8'],
            'media.*' => ['file', 'mimes:jpg,jpeg,png,webp,mp4,webm,mov', 'max:51200'],
        ];
    }
}
