<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCustomerCoordinatesBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * JSON body is an array of rows: { record_id, customer_id, latitude, longitude }.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            '*.record_id' => ['required'],
            '*.customer_id' => ['required', 'integer', 'exists:customers,id'],
            '*.latitude' => ['required', 'numeric', 'between:-90,90'],
            '*.longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }
}
