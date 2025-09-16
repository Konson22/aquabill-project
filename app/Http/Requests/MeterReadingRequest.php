<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\MeterReading;

class MeterReadingRequest extends FormRequest
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
     */
    public function rules(): array
    {
        $rules = [
            'meter_id' => 'required|exists:meters,id',
            'date' => 'required|date',
            'value' => 'required|numeric|min:0',
        ];

        // Add custom validation for value based on previous reading
        if ($this->isMethod('POST') || $this->isMethod('PUT')) {
            $rules['value'] = [
                'required',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    $meterId = $this->input('meter_id');
                    $readingId = $this->route('reading'); // For updates
                    
                    // Get the previous reading for this meter
                    $query = MeterReading::where('meter_id', $meterId);
                    
                    if ($readingId) {
                        // For updates, exclude the current reading
                        $query->where('id', '!=', $readingId);
                    }
                    
                    $previousReading = $query->orderBy('date', 'desc')->first();
                    $previousValue = $previousReading ? $previousReading->value : 0;
                    
                    if ($value < $previousValue) {
                        $fail("Current reading ({$value}) cannot be less than previous reading ({$previousValue}).");
                    }
                }
            ];
        }

        return $rules;
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'meter_id.required' => 'Please select a meter.',
            'meter_id.exists' => 'The selected meter does not exist.',
            'date.required' => 'Please select a reading date.',
            'date.date' => 'Please enter a valid date.',
            'value.required' => 'Please enter the current reading value.',
            'value.numeric' => 'The reading value must be a number.',
            'value.min' => 'The reading value cannot be negative.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'meter_id' => 'meter',
            'date' => 'reading date',
            'value' => 'current reading',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure numeric values are properly formatted
        if ($this->has('value')) {
            $this->merge([
                'value' => (float) $this->input('value'),
            ]);
        }

        // Set default source to manual_reading
        $this->merge([
            'source' => 'manual_reading',
        ]);

        // Always set billing officer to the logged-in user
        $this->merge([
            'billing_officer' => auth()->user()->name,
        ]);
    }
}
