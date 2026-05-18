<?php

namespace App\Http\Requests;

use App\Models\Bill;
use App\Models\Station;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBillPaymentRequest extends FormRequest
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
        $stationRules = Station::query()->exists()
            ? ['required', 'integer', Rule::exists('stations', 'id')]
            : ['nullable', 'integer', Rule::exists('stations', 'id')];

        return [
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_date' => ['required', 'date'],
            'payment_method' => [
                'required',
                Rule::in(['cash', 'bank', 'mobile_money', 'cheque']),
            ],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'station_id' => $stationRules,
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.max' => 'The payment amount cannot exceed the remaining balance on this bill.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var Bill|null $bill */
            $bill = $this->route('bill');
            $payment = $this->route('payment');

            if ($bill === null || $payment === null) {
                return;
            }

            $billTotal = (float) $bill->total_amount;
            $otherPaid = round((float) $bill->payments()
                ->whereKeyNot($payment->id)
                ->sum('amount'), 2);
            $maxAmount = max(0.0, round($billTotal - $otherPaid, 2));
            $amount = (float) $this->input('amount');

            if ($amount > $maxAmount + 0.00001) {
                $validator->errors()->add(
                    'amount',
                    'The payment amount cannot exceed '.number_format($maxAmount, 2, '.', '').' for this bill.',
                );
            }
        });
    }

    protected function prepareForValidation(): void
    {
        $raw = $this->input('station_id');

        if ($raw === '' || $raw === null) {
            $this->merge(['station_id' => null]);
        } elseif (is_numeric($raw)) {
            $this->merge(['station_id' => (int) $raw]);
        }
    }
}
