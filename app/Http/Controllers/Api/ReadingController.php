<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MeterReading;
use App\Models\Meter;
use App\Models\Bill;
use Illuminate\Support\Facades\DB;

class ReadingController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            '*.meter_id' => 'required|exists:meters,id',
            '*.home_id' => 'required|exists:homes,id',
            '*.reading_date' => 'required|date',
            '*.current_reading' => 'required|numeric|min:0',
            '*.previous_reading' => 'nullable|numeric|min:0',
        ]);

        $results = [];
        
        try {
            DB::beginTransaction();

            foreach ($request->all() as $validated) {
                $meter = \App\Models\Meter::with('home.customer', 'home.tariff')->findOrFail($validated['meter_id']);

                // Get previous reading if not provided
                if (!isset($validated['previous_reading']) || is_null($validated['previous_reading'])) {
                    $previousReading = MeterReading::where('meter_id', $validated['meter_id'])
                        ->where('status', 'billed')
                        ->latest('reading_date')
                        ->first();
                    $validated['previous_reading'] = $previousReading ? $previousReading->current_reading : 0;
                }

                $consumption = max(0, $validated['current_reading'] - $validated['previous_reading']);
                
                $tariff = $meter->home->tariff;
                $tariffRate = $tariff ? $tariff->price : 0;
                $fixedCharge = $tariff ? $tariff->fixed_charge : 0;
                $consumptionAmount = $consumption * $tariffRate;

                // Previous Balance calculation
                $lastBill = Bill::where('home_id', $meter->home_id)
                    ->where('status', '!=', 'cancelled')
                    ->where('status', '!=', 'forwarded')
                    ->latest('id')
                    ->first();
                
                $previousBalance = 0;
                if ($lastBill) {
                    $previousBalance = ($lastBill->status === 'paid') ? 0 : $lastBill->current_balance;
                }

                $totalAmount = $consumptionAmount + $fixedCharge + $previousBalance;

                $reading = MeterReading::create([
                    'meter_id' => $validated['meter_id'],
                    'home_id' => $validated['home_id'],
                    'reading_date' => $validated['reading_date'],
                    'current_reading' => $validated['current_reading'],
                    'previous_reading' => $validated['previous_reading'],
                    'read_by' => auth()->id(),
                    'status' => 'billed',
                ]);

                // Generate unique bill number
                do {
                    $billCount = Bill::count();
                    $billNumber = 'BILL-' . str_pad($billCount + 1, 8, '0', STR_PAD_LEFT);
                } while (Bill::where('bill_number', $billNumber)->exists());

                // Handle previous bills
                if ($lastBill && $lastBill->status != 'paid') {
                    $lastBill->update(['status' => 'forwarded']);
                }
                Bill::where('home_id', $meter->home_id)
                    ->whereIn('status', ['pending', 'overdue', 'partial_paid'])
                    ->where('id', '!=', $lastBill ? $lastBill->id : 0)
                    ->update(['status' => 'forwarded']);

                $readingDate = \Carbon\Carbon::parse($validated['reading_date']);
                
                Bill::create([
                    'bill_number' => $billNumber,
                    'meter_reading_id' => $reading->id,
                    'customer_id' => $meter->home->customer_id,
                    'home_id' => $meter->home_id,
                    'billing_period_start' => $readingDate->copy()->startOfMonth(),
                    'billing_period_end' => $readingDate->copy()->endOfMonth(),
                    'consumption' => $consumption,
                    'tariff' => $tariffRate,
                    'fix_charges' => $fixedCharge,
                    'total_amount' => $totalAmount,
                    'current_balance' => $totalAmount,
                    'previous_balance' => $previousBalance,
                    'due_date' => $readingDate->copy()->addDays(14),
                    'status' => 'pending',
                ]);

                $results[] = [
                    'meter_id' => $reading->meter_id,
                    'home_id' => $reading->home_id,
                    'reading_date' => $reading->reading_date,
                    'current_reading' => $reading->current_reading,
                ];
            }

            DB::commit();

            return response()->json($results, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to record readings', 'error' => $e->getMessage()], 500);
        }
    }
}
