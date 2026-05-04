<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMeterReadingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'previous_reading' => ['required', 'numeric', 'min:0'],
            'current_reading' => ['required', 'numeric', 'min:0', 'gte:previous_reading'],
            'reading_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
