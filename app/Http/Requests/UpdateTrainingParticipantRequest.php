<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTrainingParticipantRequest extends FormRequest
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
            'status' => ['required', Rule::in(['enrolled', 'attended', 'completed', 'absent'])],
            'score' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'remarks' => ['nullable', 'string'],
            'certificate' => ['nullable', 'file', 'max:5120', 'mimes:pdf,jpeg,jpg,png'],
        ];
    }
}
