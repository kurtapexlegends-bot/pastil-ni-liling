<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePayoutRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id',
            'hub_id' => 'required|exists:hubs,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'base_pay' => 'required|numeric',
            'commission_pay' => 'required|numeric',
            'total_pay' => 'required|numeric',
        ];
    }
}
