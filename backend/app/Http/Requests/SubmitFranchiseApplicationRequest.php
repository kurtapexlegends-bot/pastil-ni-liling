<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SubmitFranchiseApplicationRequest extends FormRequest
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'target_location' => 'required|string|max:255',
            'investment_capacity' => 'required|string',
            'experience_summary' => 'nullable|string',
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->has('email')) {
            $this->merge([
                'email' => \Illuminate\Support\Str::lower($this->email),
            ]);
        }
    }
}
