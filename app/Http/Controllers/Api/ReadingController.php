<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ReadingController extends Controller
{

    public function store(Request $request)
    {
        $input = $request->has('readings') ? $request->input('readings') : $request->all();

        if (is_array($input) && isset($input['customer_id'])) {
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
                // Mobile app sends home_id (same as customer_id per API contract)
                $normalized = $itemData;
                if (isset($normalized['home_id']) && !isset($normalized['customer_id'])) {
                    $normalized['customer_id'] = $normalized['home_id'];
                }

                $validated = validator($normalized, [
                    'customer_id' => ['required_without:meter_id', 'nullable', 'exists:customers,id'],
                    'meter_id' => ['nullable', 'exists:meters,id'],
                    'reading_date' => ['required', 'date'],
                    'current_reading' => ['required', 'numeric', 'min:0'],
                    'previous_reading' => ['nullable', 'numeric', 'min:0'],
                    'notes' => ['nullable', 'string'],
                    'image' => ['nullable', 'string'],
                ])->validate();

                // Resolve meter and customer (match MeterReadingController: meter with customer.tariff)
                if (!empty($validated['meter_id'])) {
                    $meter = Meter::with('customer.tariff')->findOrFail($validated['meter_id']);
                    $customer = $meter->customer;
                } else {
                    $customer = Customer::with(['meter', 'tariff'])->findOrFail($validated['customer_id']);
                    $meter = $customer->meter;
                }

                if (!$customer) {
                    $errors[] = ['index' => $index, 'message' => "Reading #{$index}: Meter must be associated with a customer."];
                    continue;
                }
                if (!$meter) {
                    $errors[] = ['index' => $index, 'message' => "Reading #{$index}: No meter found for customer {$validated['customer_id']}."];
                    continue;
                }

                // Fetch the latest reading from database to validate against
                $dbLastReading = MeterReading::where('meter_id', $meter->id)
                    ->where('customer_id', $customer->id)
                    ->orderBy('reading_date', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();

                if ($dbLastReading && $validated['current_reading'] <= $dbLastReading->current_reading) {
                    $errors[] = [
                        'index' => $index,
                        'message' => "Current reading ({$validated['current_reading']}) must be greater than the last recorded reading ({$dbLastReading->current_reading}).",
                    ];
                    continue;
                }

                // Get previous reading if not provided
                if (!isset($validated['previous_reading']) || $validated['previous_reading'] === null) {
                    $validated['previous_reading'] = $dbLastReading ? $dbLastReading->current_reading : 0;
                }

                // Calculate consumption units
                $consumption = max(0, $validated['current_reading'] - $validated['previous_reading']);

                // Handle image upload (API: base64 or file)
                // For compatibility with environments where storage symlinks are problematic,
                // store directly under public/readings and save a web path usable with asset().
                $imagePath = null;
                if (!empty($itemData['image']) && is_string($itemData['image']) && str_starts_with($itemData['image'], 'data:image')) {
                    try {
                        $imageData = $itemData['image'];
                        $extension = explode('/', explode(':', substr($imageData, 0, strpos($imageData, ';')))[1])[1];
                        $replace = substr($imageData, 0, strpos($imageData, ',') + 1);
                        $image = str_replace($replace, '', $imageData);
                        $image = str_replace(' ', '+', $image);
                        $imageName = 'reading_' . time() . '_' . $index . '.' . $extension;
                        $publicPath = public_path('readings/' . $imageName);
                        if (!is_dir(dirname($publicPath))) {
                            mkdir(dirname($publicPath), 0755, true);
                        }
                        file_put_contents($publicPath, base64_decode($image));
                        $imagePath = 'readings/' . $imageName; // relative to public for asset()
                    } catch (\Exception $e) {
                        // Log or handle base64 decode failure
                    }
                } elseif ($request->hasFile("readings.{$index}.image")) {
                    $imagePath = $request->file("readings.{$index}.image")->store('readings', 'public');
                } elseif ($request->hasFile("image") && count($items) === 1) {
                    $imagePath = $request->file("image")->store('readings', 'public');
                }

                DB::beginTransaction();

                // Create the reading
                $reading = MeterReading::create([
                    'meter_id' => $meter->id,
                    'customer_id' => $customer->id,
                    'reading_date' => $validated['reading_date'],
                    'current_reading' => $validated['current_reading'],
                    'previous_reading' => $validated['previous_reading'],
                    'read_by' => Auth::id(),
                    'status' => 'billed',
                    'image' => $imagePath,
                    'notes' => $validated['notes'] ?? null,
                ]);

                // Billing logic
                $tariff = $customer->tariff;
                $tariffRate = $tariff ? $tariff->price : 0;
                $fixedCharge = $tariff ? $tariff->fixed_charge : 0;
                $consumptionAmount = $consumption * $tariffRate;

                // Previous balance from last active bill
                $lastBill = Bill::where('customer_id', $customer->id)
                    ->where('status', '!=', 'cancelled')
                    ->where('status', '!=', 'forwarded')
                    ->latest('id')
                    ->first();

                $previousBalance = 0;
                if ($lastBill) {
                    if ($lastBill->status !== 'fully paid') {
                        $previousBalance = $lastBill->balance;
                        $lastBill->update(['status' => 'forwarded']);
                    }
                }

                // Ensure any other lingering unpaid bills are also forwarded
                Bill::where('customer_id', $customer->id)
                    ->whereIn('status', ['pending', 'overdue', 'partial paid'])
                    ->update(['status' => 'forwarded']);

                $amount = $consumptionAmount + $fixedCharge; // current consumption amount
                $totalAmount = $amount + $previousBalance;

                // Generate unique bill number
                $billCount = Bill::count();
                $billNumber = 'BILL-' . str_pad($billCount + 1, 8, '0', STR_PAD_LEFT);

                // Calculate billing period and due date
                $readingDate = Carbon::parse($validated['reading_date']);

                // Create the bill
                $bill = Bill::create([
                    'bill_number' => $billNumber,
                    'meter_reading_id' => $reading->id,
                    'customer_id' => $customer->id,
                    'billing_period_start' => $readingDate->copy()->startOfMonth(),
                    'billing_period_end' => $readingDate->copy()->endOfMonth(),
                    'tariff' => $tariffRate,
                    'fix_charges' => $fixedCharge,
                    'previous_balance' => $previousBalance,
                    'amount' => $amount,
                    'total_amount' => $totalAmount,
                    'due_date' => $readingDate->copy()->addDays(14),
                    'status' => 'pending',
                ]);

                DB::commit();
                $results[] = [
                    'customer_id' => $customer->id,
                    'reading_id' => $reading->id,
                    'bill_number' => $bill->bill_number,
                    'total' => $totalAmount,
                    'index' => $index,
                ];
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Failed to process reading at index {$index}", [
                    'error' => $e->getMessage(),
                    'item_data' => $itemData,
                ]);
                $errors[] = [
                    'index' => $index,
                    'message' => $e->getMessage(),
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
