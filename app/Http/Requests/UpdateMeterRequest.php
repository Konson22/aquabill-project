<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMeterRequest extends FormRequest
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
        $meter = $this->route('meter');

        return [
            'meter_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('meters', 'meter_number')->ignore($meter?->id),
            ],
            'last_reading' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:active,inactive,maintenance,damage'],
        ];
    }
}
