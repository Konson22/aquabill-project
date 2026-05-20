<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAppSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'billing_cycle' => ['required', Rule::in(['monthly', 'bimonthly', 'quarterly'])],
            'billing_cycle_day' => ['required', 'integer', 'min:1', 'max:28'],
        ];
    }
}
