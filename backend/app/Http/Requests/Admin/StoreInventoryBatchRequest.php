<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreInventoryBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'batch_number' => ['required', 'string', 'unique:inventory_batches,batch_number'],
            'product_id' => ['required', 'exists:products,id'],
            'hub_id' => ['nullable', 'exists:hubs,id'],
            'initial_quantity' => ['required', 'integer', 'min:1'],
            'manufacture_date' => ['required', 'date'],
            'expiry_date' => ['required', 'date', 'after_or_equal:manufacture_date'],
        ];
    }
}
