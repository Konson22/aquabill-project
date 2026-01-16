<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MeterReading;
use App\Models\Meter;
use App\Models\Bill;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
            '*.image' => 'nullable',
        ]);

        $results = [];
        
        try {
            DB::beginTransaction();

            foreach ($request->all() as $index => $validated) {
                // Check if reading is valid against last DB reading
                $lastDbReading = MeterReading::where('meter_id', $validated['meter_id'])
                    ->latest('reading_date')
                    ->first();

                if ($lastDbReading && $validated['current_reading'] <= $lastDbReading->current_reading) {
                    continue;
                }

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

                // Handle image upload if present
                $imagePath = null;
                if (isset($validated['image']) && $validated['image']) {
                    if (is_string($validated['image']) && str_starts_with($validated['image'], 'data:image')) {
                        // Handle base64
                        $format = explode('/', explode(':', substr($validated['image'], 0, strpos($validated['image'], ';')))[1])[1];
                        $image = str_replace(' ', '+', $validated['image']);
                        $image = substr($image, strpos($image, ',') + 1);
                        $imageName = 'reading_' . time() . '_' . Str::random(10) . '.' . $format;
                        Storage::disk('public')->put('readings/' . $imageName, base64_decode($image));
                        $imagePath = 'readings/' . $imageName;
                    } elseif ($request->hasFile("readings.{$index}.image")) {
                        // Handle direct file upload (if key is readings.0.image)
                        // Note: $request->all() loop index needed
                        $imagePath = $request->file("readings.{$index}.image")->store('readings', 'public');
                    } else if (is_string($validated['image']) && !str_starts_with($validated['image'], 'data:image')) {
                         // Assume it's already a path or filename if sent as string (rare but possible)
                         $imagePath = $validated['image'];
                    }
                }

                $reading = MeterReading::create([
                    'meter_id' => $validated['meter_id'],
                    'home_id' => $validated['home_id'],
                    'reading_date' => $validated['reading_date'],
                    'current_reading' => $validated['current_reading'],
                    'previous_reading' => $validated['previous_reading'],
                    'read_by' => auth()->id(),
                    'status' => 'billed',
                    'image' => $imagePath,
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
