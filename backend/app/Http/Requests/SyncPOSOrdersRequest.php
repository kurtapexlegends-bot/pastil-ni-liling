<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SyncPOSOrdersRequest extends FormRequest
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
            'orders' => 'required|array',
            'orders.*.offline_id' => 'required|string',
            'orders.*.total_amount' => 'required|numeric',
            'orders.*.payment_method' => 'required|string|in:gcash,paymaya,cod,cash,grab_pay,foodpanda_pay,online_card',
            'orders.*.channel' => 'nullable|string|in:walk_in,grab,foodpanda,shopee,tiktok,e_commerce',
            'orders.*.items' => 'required|array',
            'orders.*.items.*.product_id' => 'required|exists:products,id',
            'orders.*.items.*.quantity' => 'required|integer|min:1',
            'orders.*.items.*.price' => 'required|numeric',
            'orders.*.items.*.flavor_modifier' => 'nullable|string',
        ];
    }
}
