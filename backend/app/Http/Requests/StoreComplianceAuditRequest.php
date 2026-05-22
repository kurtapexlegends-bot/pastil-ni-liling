<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreComplianceAuditRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'hub_id' => 'required|exists:hubs,id',
            'hygiene_score' => 'required|integer|min:0|max:100',
            'recipe_adherence_score' => 'required|integer|min:0|max:100',
            'notes' => 'nullable|string',
            'kitchen_photo' => 'nullable|string',
        ];
    }
}
