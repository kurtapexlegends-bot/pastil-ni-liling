<?php

namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hub_id' => ['nullable', 'exists:hubs,id'],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'date' => ['sometimes', 'required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
