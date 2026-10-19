<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecipeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'ingredient_id' => ['required', 'exists:ingredients,id'],
            'quantity_required' => ['required', 'numeric', 'min:0.0001'],
        ];
    }
}
