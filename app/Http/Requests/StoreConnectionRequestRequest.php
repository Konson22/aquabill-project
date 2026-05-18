<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConnectionRequestRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'national_id' => ['nullable', 'string', 'max:50'],
            'address' => ['required', 'string'],
            'plot_no' => ['nullable', 'string', 'max:255'],
            'customer_type' => ['required', 'string', Rule::in(['residential', 'commercial', 'government'])],
            'zone_id' => ['required', 'integer', 'exists:zones,id'],
            'tariff_id' => ['required', 'integer', 'exists:tariffs,id'],
            'issued_date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.service_charge_type_id' => ['nullable', 'integer', 'exists:service_charge_types,id'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.amount' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Add at least one fee line item.',
            'items.min' => 'Add at least one fee line item.',
        ];
    }
}
