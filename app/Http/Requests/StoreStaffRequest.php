<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStaffRequest extends FormRequest
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
            'hr_department_id' => ['nullable', 'integer', Rule::exists('hr_departments', 'id')],
            'employee_number' => ['nullable', 'string', 'max:255', Rule::unique('staff', 'employee_number')],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['active', 'inactive', 'on_leave'])],
            'hired_on' => ['nullable', 'date'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
            'bank_account_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (
            [
                'hr_department_id',
                'employee_number',
                'phone',
                'email',
                'job_title',
                'hired_on',
                'bank_name',
                'bank_account_name',
                'bank_account_number',
                'notes',
            ] as $key
        ) {
            if ($this->has($key) && $this->input($key) === '') {
                $this->merge([$key => null]);
            }
        }
    }
}
