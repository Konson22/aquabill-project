<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Bill;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ReadingController extends Controller
{
    public function index()
    {
        $readings = MeterReading::with(['meter', 'home.customer', 'reader'])
            ->latest('reading_date')
            ->paginate(15);
            
        return response()->json($readings);
    }

    public function store(Request $request)
    {
        $input = $request->has('readings') ? $request->input('readings') : $request->all();
        
        if (is_array($input) && isset($input['home_id'])) {
            $items = [$input];
        } elseif (is_array($input) && count($input) > 0 && isset($input[0])) {
            $items = $input;
        } else {
            $items = is_array($input) ? $input : [];
        }

        $results = [];
        $errors = [];

        foreach ($items as $index => $itemData) {
            try {
                $validated = validator($itemData, [
                    'home_id' => ['required', 'exists:homes,id'],
                    'meter_id' => ['nullable', 'exists:meters,id'],
                    'reading_date' => ['required', 'date'],
                    'current_reading' => ['required', 'numeric', 'min:0'],
                    'previous_reading' => ['nullable', 'numeric', 'min:0'],
                    'notes' => ['nullable', 'string'],
                    'image' => ['nullable', 'string'],
                ])->validate();

                $home = \App\Models\Home::with(['meter', 'tariff', 'customer'])->findOrFail($validated['home_id']);
                
                $meterId = $validated['meter_id'] ?? ($home->meter ? $home->meter->id : null);

                if (!$meterId) {
                    $errors[] = "Reading #{$index}: No meter found for home {$validated['home_id']}.";
                    continue;
                }

                // Fetch the latest reading from database to validate against
                $dbLastReading = MeterReading::where('meter_id', $meterId)
                    ->where('home_id', $home->id)
                    ->orderBy('reading_date', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();

                if ($dbLastReading && $validated['current_reading'] < $dbLastReading->current_reading) {
                    $errors[] = [
                        'index' => $index,
                        'message' => "Current reading ({$validated['current_reading']}) cannot be less than the last recorded reading ({$dbLastReading->current_reading})."
                    ];
                    continue;
                }

                // Use DB last reading as previous if not provided by app
                if (!isset($validated['previous_reading']) || $validated['previous_reading'] === null) {
                    $validated['previous_reading'] = $dbLastReading ? $dbLastReading->current_reading : 0;
                }

                $consumption = max(0, $validated['current_reading'] - $validated['previous_reading']);
                
                $imagePath = null;
                
                if (!empty($itemData['image']) && is_string($itemData['image']) && str_starts_with($itemData['image'], 'data:image')) {
                    try {
                        $imageData = $itemData['image'];
                        $extension = explode('/', explode(':', substr($imageData, 0, strpos($imageData, ';')))[1])[1];
                        $replace = substr($imageData, 0, strpos($imageData, ',') + 1);
                        $image = str_replace($replace, '', $imageData);
                        $image = str_replace(' ', '+', $image);
                        $imageName = 'reading_' . time() . '_' . $index . '.' . $extension;
                        \Storage::disk('public')->put('readings/' . $imageName, base64_decode($image));
                        $imagePath = 'readings/' . $imageName;
                    } catch (\Exception $e) {
                         // Log or handle base64 decode failure
                    }
                } 
                // 2. Check for traditional File upload
                elseif ($request->hasFile("readings.{$index}.image")) {
                    $imagePath = $request->file("readings.{$index}.image")->store('readings', 'public');
                } elseif ($request->hasFile("image") && count($items) === 1) {
                    $imagePath = $request->file("image")->store('readings', 'public');
                }

                DB::beginTransaction();
                
                $reading = MeterReading::create([
                    'meter_id' => $meterId,
                    'home_id' => $home->id,
                    'reading_date' => $validated['reading_date'],
                    'current_reading' => $validated['current_reading'],
                    'previous_reading' => $validated['previous_reading'],
                    'read_by' => Auth::id(),
                    'status' => 'billed',
                    'image' => $imagePath,
                    'notes' => $validated['notes'] ?? null,
                ]);

                $tariff = $home->tariff;
                $tariffPrice = $tariff ? $tariff->price : 0;
                $fixedCharge = $tariff ? $tariff->fixed_charge : 0;
                $consumptionAmount = $consumption * $tariffPrice;
                
                $lastBill = Bill::where('home_id', $home->id)
                    ->where('status', '!=', 'cancelled')
                    ->where('status', '!=', 'forwarded')
                    ->latest('id')
                    ->first();
                    
                $previousBalance = 0;
                if ($lastBill) {
                    if ($lastBill->status !== 'fully paid') {
                        $previousBalance = $lastBill->current_balance;
                        $lastBill->update(['status' => 'forwarded']);
                    }
                }
                
                Bill::where('home_id', $home->id)
                    ->whereIn('status', ['pending', 'overdue', 'partial paid'])
                    ->update(['status' => 'forwarded']);

                $totalAmount = $consumptionAmount + $fixedCharge + $previousBalance;
                $billCount = Bill::count();
                $billNumber = 'BILL-' . str_pad($billCount + 1, 8, '0', STR_PAD_LEFT);
                $readingDate = Carbon::parse($validated['reading_date']);
                
                $bill = Bill::create([
                    'bill_number' => $billNumber,
                    'meter_reading_id' => $reading->id,
                    'customer_id' => $home->customer_id,
                    'home_id' => $home->id,
                    'billing_period_start' => $readingDate->copy()->startOfMonth(),
                    'billing_period_end' => $readingDate->copy()->endOfMonth(),
                    'consumption' => $consumption,
                    'tariff' => $tariffPrice,
                    'fix_charges' => $fixedCharge,
                    'total_amount' => $totalAmount,
                    'current_balance' => $totalAmount,
                    'previous_balance' => $previousBalance,
                    'due_date' => $readingDate->copy()->addDays(14),
                    'status' => 'pending',
                ]);

                DB::commit();
                $results[] = [
                    'home_id' => $home->id,
                    'reading_id' => $reading->id,
                    'bill_number' => $bill->bill_number,
                    'total' => $totalAmount,
                    'index' => $index
                ];

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Failed to process reading at index {$index}", [
                    'error' => $e->getMessage(),
                    'item_data' => $itemData
                ]);
                $errors[] = [
                    'index' => $index,
                    'message' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'message' => count($results) . ' readings processed.',
            'success_count' => count($results),
            'error_count' => count($errors),
            'results' => $results,
            'errors' => $errors
        ], (count($errors) > 0 && count($results) === 0) ? 422 : 201);
    }
}
