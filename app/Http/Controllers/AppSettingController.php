<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateAppSettingRequest;
use App\Models\AppSetting;
use App\Services\BillingPeriodService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AppSettingController extends Controller
{
    public function edit(): Response
    {
        $settings = AppSetting::current();
        [$periodStart, $periodEnd] = $settings->billingPeriodBounds();

        return Inertia::render('admin/setting/billing-cycle', [
            'settings' => [
                'billing_cycle' => $settings->billing_cycle,
                'billing_cycle_day' => (int) $settings->billing_cycle_day,
                'current_billing_period_start' => $periodStart->toDateString(),
                'current_billing_period_end' => $periodEnd->toDateString(),
            ],
        ]);
    }

    public function update(UpdateAppSettingRequest $request, BillingPeriodService $billingPeriodService): RedirectResponse
    {
        $settings = AppSetting::current();
        $validated = $request->validated();

        [$periodStart, $periodEnd] = $billingPeriodService->resolveFor(
            now(),
            (int) $validated['billing_cycle_day'],
        );

        $settings->update([
            ...$validated,
            'current_billing_period_start' => $periodStart->toDateString(),
            'current_billing_period_end' => $periodEnd->toDateString(),
        ]);

        return back()->with('success', 'Billing cycle settings saved.');
    }
}
