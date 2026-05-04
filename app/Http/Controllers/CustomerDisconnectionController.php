<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Disconnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CustomerDisconnectionController extends Controller
{
    public function disconnectionStatus(Customer $customer): Response
    {
        $customer->load([
            'zone',
            'disconnections' => fn ($query) => $query->with(['disconnectedBy', 'reconnectedBy'])->latest(),
        ]);

        return Inertia::render('customers/disconnection-status', [
            'customer' => $customer,
        ]);
    }

    /**
     * Printable disconnection notice (opens in a new tab from the UI).
     */
    public function printNotification(Customer $customer): Response
    {
        $customer->load([
            'zone',
            'disconnections' => fn ($query) => $query->with(['disconnectedBy', 'reconnectedBy'])->latest(),
        ]);

        $activeNotice = $customer->disconnections->first(
            fn (Disconnection $d): bool => in_array($d->status, ['notified', 'grace_period'], true)
        );

        return Inertia::render('customers/print-notification', [
            'customer' => $customer,
            'activeNotice' => $activeNotice,
        ]);
    }

    public function index()
    {
        $stats = Disconnection::summaryStats();

        $disconnections = Disconnection::with(['customer.zone', 'disconnectedBy'])
            ->whereIn('status', ['notified', 'grace_period', 'disconnected'])
            ->latest()
            ->paginate(50);

        return Inertia::render('connection-management/index', [
            'stats' => $stats,
            'disconnections' => $disconnections,
        ]);
    }

    public function notify(Request $request, Customer $customer)
    {
        $request->validate([
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        // Create a disconnection notice record
        Disconnection::create([
            'customer_id' => $customer->id,
            'notified_at' => now(),
            'notice_ends_at' => now()->addDays(30),
            'grace_period_ends_at' => now()->addDays(45), // 30 days notice + 15 days extra
            'status' => 'notified',
            'reason' => $request->reason,
            'notes' => $request->notes,
            'disconnected_by' => Auth::id(),
        ]);

        return back()->with('success', 'Disconnection notice issued. 30 days notice + 15 days grace period started.');
    }

    public function cancelNotice(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $disconnection = $customer->disconnections()
            ->whereIn('status', ['notified', 'grace_period'])
            ->latest()
            ->first();

        if (! $disconnection) {
            return back()->with('error', 'No active disconnection notice to cancel.');
        }

        $suffix = "\n\nNotice cancelled on ".now()->toDateTimeString().' by user #'.(Auth::id() ?? 'system').'.';
        if (! empty($validated['notes'])) {
            $suffix .= ' '.$validated['notes'];
        }

        $disconnection->update([
            'status' => 'cancelled',
            'notes' => trim((string) ($disconnection->notes ?? '')).$suffix,
        ]);

        return back()->with('success', 'Disconnection notice cancelled.');
    }

    public function disconnect(Request $request, Customer $customer)
    {
        $request->validate([
            'disconnection_type' => 'required|in:meter_removed,water_blocked',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $disconnection = $customer->disconnections()->whereIn('status', ['notified', 'grace_period'])->latest()->first();

        if (! $disconnection) {
            $disconnection = Disconnection::create([
                'customer_id' => $customer->id,
                'notified_at' => now(),
                'notice_ends_at' => now(),
                'grace_period_ends_at' => now(),
                'status' => 'disconnected',
                'disconnection_type' => $request->disconnection_type,
                'disconnected_at' => now(),
                'disconnected_by' => Auth::id(),
                'reason' => $request->reason ?? 'Immediate disconnection',
                'notes' => $request->notes,
            ]);
        } else {
            $disconnection->update([
                'status' => 'disconnected',
                'disconnection_type' => $request->disconnection_type,
                'disconnected_at' => now(),
                'disconnected_by' => Auth::id(),
                'notes' => $disconnection->notes."\n\nActual disconnection (".str_replace('_', ' ', $request->disconnection_type).') performed on '.now()->toDateTimeString(),
            ]);
        }

        $customer->update(['status' => 'disconnected']);

        // If meter_removed, unassign the meter so it can be reassigned later.
        if ($request->disconnection_type === 'meter_removed') {
            $customer->meters()->update([
                'status' => 'inactive',
                'customer_id' => null,
            ]);
        }

        return back()->with('success', 'Customer disconnected successfully.');
    }

    public function reconnect(Request $request, Customer $customer)
    {
        $disconnection = $customer->disconnections()->where('status', 'disconnected')->latest()->first();

        if ($disconnection) {
            $disconnection->update([
                'status' => 'reconnected',
                'reconnected_at' => now(),
                'reconnected_by' => Auth::id(),
                'notes' => $disconnection->notes."\n\nReconnection performed on ".now()->toDateTimeString(),
            ]);
        }

        $customer->update(['status' => 'active']);

        return back()->with('success', 'Customer reconnected successfully.');
    }
}
