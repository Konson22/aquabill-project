<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Services\BillService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ReadingController extends Controller
{
    public function store(Request $request, BillService $billService)
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
                if (isset($normalized['home_id']) && ! isset($normalized['customer_id'])) {
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
                if (! empty($validated['meter_id'])) {
                    $meter = Meter::with('customer.tariff')->findOrFail($validated['meter_id']);
                    $customer = $meter->customer;
                } else {
                    $customer = Customer::with(['meters', 'tariff'])->findOrFail($validated['customer_id']);
                    $meter = $customer->meters->first();
                }

                if (! $customer) {
                    $errors[] = ['index' => $index, 'message' => "Reading #{$index}: Meter must be associated with a customer."];

                    continue;
                }
                if (! $meter) {
                    $errors[] = ['index' => $index, 'message' => "Reading #{$index}: No meter found for customer {$validated['customer_id']}."];

                    continue;
                }

                // Fetch the latest reading from database to validate against
                $dbLastReading = MeterReading::where('meter_id', $meter->id)
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

                // Handle image upload (API: base64 or file)
                $imagePath = null;

                // Case 1: Base64 Image
                if (! empty($itemData['image']) &&
                    is_string($itemData['image']) &&
                    str_starts_with($itemData['image'], 'data:image')
                ) {
                    try {
                        $imageData = $itemData['image'];

                        // Get extension
                        preg_match("/data:image\/(.*?);base64,/", $imageData, $matches);
                        $extension = $matches[1] ?? 'png';

                        // Remove header
                        $image = preg_replace("/^data:image\/(.*?);base64,/", '', $imageData);
                        $image = str_replace(' ', '+', $image);

                        $imageName = 'reading_'.time().'_'.$index.'.'.$extension;

                        // Store in storage/app/public/readings
                        Storage::disk('public')->put(
                            'readings/'.$imageName,
                            base64_decode($image)
                        );

                        $imagePath = 'readings/'.$imageName;

                    } catch (\Exception $e) {
                        Log::error('Base64 image upload failed: '.$e->getMessage());
                    }

                    // Case 2: Nested file upload (readings[index][image])
                } elseif ($request->hasFile("readings.{$index}.image")) {

                    $imagePath = $request
                        ->file("readings.{$index}.image")
                        ->store('readings', 'public');

                    // Case 3: Single file upload
                } elseif ($request->hasFile('image') && count($items) === 1) {

                    $imagePath = $request
                        ->file('image')
                        ->store('readings', 'public');
                }

                $bill = DB::transaction(function () use ($validated, $meter, $imagePath, $billService) {
                    $reading = MeterReading::create([
                        'meter_id' => $meter->id,
                        'reading_date' => $validated['reading_date'],
                        'current_reading' => $validated['current_reading'],
                        'previous_reading' => $validated['previous_reading'] ?? null,
                        'recorded_by' => Auth::id(),
                        'image' => $imagePath,
                        'notes' => $validated['notes'] ?? null,
                    ]);

                    // Generate bill + forwarding logic (kept in BillService for consistency)
                    $bill = $billService->generateForMeter($reading->meter_id);

                    return [$reading, $bill];
                });

                [$reading, $createdBill] = $bill;

                $results[] = [
                    'customer_id' => $customer->id,
                    'reading_id' => $reading->id,
                    'bill_number' => $createdBill ? 'BILL-'.$createdBill->id : null,
                    'total' => $createdBill?->total_amount ?? 0,
                    'index' => $index,
                ];
            } catch (\Exception $e) {
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
            'message' => count($results).' readings processed.',
            'success_count' => count($results),
            'error_count' => count($errors),
            'results' => $results,
            'errors' => $errors,
        ], (count($errors) > 0 && count($results) === 0) ? 422 : 201);
    }
}
