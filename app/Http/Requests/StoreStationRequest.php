<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreStationRequest extends FormRequest
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
            'zone_id' => ['nullable', 'integer', 'exists:zones,id'],
            'accountant_id' => ['nullable', 'integer', 'exists:users,id'],
            'manager_name' => ['nullable', 'string', 'max:255'],
            'manager_phone' => ['nullable', 'string', 'max:32'],
            'coordinate' => ['nullable', 'string', 'max:255'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $zone = $this->input('zone_id');
        $accountant = $this->input('accountant_id');

        $this->merge([
            'zone_id' => ($zone === null || $zone === '') ? null : (int) $zone,
            'accountant_id' => ($accountant === null || $accountant === '') ? null : (int) $accountant,
        ]);
    }
}
