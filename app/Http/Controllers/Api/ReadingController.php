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
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Throwable;

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
                // Mobile app sends customer_id (same as customer_id per API contract)
                $normalized = $itemData;
                if (isset($normalized['customer_id']) && ! isset($normalized['customer_id'])) {
                    $normalized['customer_id'] = $normalized['customer_id'];
                }

                $validated = validator($normalized, [
                    'customer_id' => ['required_without:meter_id', 'nullable', 'exists:customers,id'],
                    'meter_id' => ['nullable', 'exists:meters,id'],
                    'reading_date' => ['required', 'date'],
                    'current_reading' => ['required', 'numeric', 'min:0'],
                    'previous_reading' => ['nullable', 'numeric', 'min:0'],
                    'notes' => ['nullable', 'string'],
                    'image' => ['nullable', 'string'],
                    'bill_no' => ['nullable', 'string', 'max:255', Rule::unique('bills', 'bill_no')],
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
                    $message = "Reading #{$index}: Meter must be associated with a customer.";
                    Log::warning('Reading API: meter has no customer', [
                        'index' => $index,
                        'meter_id' => $meter->id ?? null,
                        'item_data' => $itemData,
                    ]);
                    $errors[] = ['index' => $index, 'message' => $message];

                    continue;
                }
                if (! $meter) {
                    $message = "Reading #{$index}: No meter found for customer {$validated['customer_id']}.";
                    Log::warning('Reading API: customer has no meter', [
                        'index' => $index,
                        'customer_id' => $validated['customer_id'] ?? null,
                        'item_data' => $itemData,
                    ]);
                    $errors[] = ['index' => $index, 'message' => $message];

                    continue;
                }

                // Fetch the latest reading from database to validate against
                $dbLastReading = MeterReading::where('meter_id', $meter->id)
                    ->where('customer_id', $customer->id)
                    ->orderBy('reading_date', 'desc')
                    ->orderBy('id', 'desc')
                    ->first();

                if ($dbLastReading && $validated['current_reading'] <= $dbLastReading->current_reading) {
                    $message = "Current reading ({$validated['current_reading']}) must be greater than the last recorded reading ({$dbLastReading->current_reading}).";
                    Log::warning('Reading API: current reading not greater than last', [
                        'index' => $index,
                        'customer_id' => $customer->id,
                        'meter_id' => $meter->id,
                        'current_reading' => $validated['current_reading'],
                        'last_reading' => $dbLastReading->current_reading,
                    ]);
                    $errors[] = [
                        'index' => $index,
                        'message' => $message,
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

                    } catch (Throwable $e) {
                        Log::error('Reading API: base64 image upload failed', [
                            'index' => $index,
                            'exception' => $e,
                        ]);
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

                $bill = DB::transaction(function () use ($validated, $meter, $customer, $imagePath, $billService) {
                    $billNoFromApp = isset($validated['bill_no'])
                        ? trim((string) $validated['bill_no'])
                        : '';

                    $reading = MeterReading::create([
                        'meter_id' => $meter->id,
                        'customer_id' => $customer->id,
                        'reading_date' => $validated['reading_date'],
                        'current_reading' => $validated['current_reading'],
                        'previous_reading' => $validated['previous_reading'] ?? null,
                        'recorded_by' => Auth::id(),
                        'image' => $imagePath,
                        'notes' => $validated['notes'] ?? null,
                        'bill_no' => $billNoFromApp !== '' ? $billNoFromApp : null,
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
            } catch (ValidationException $e) {
                Log::warning('Reading API: validation failed', [
                    'index' => $index,
                    'errors' => $e->errors(),
                    'item_data' => $itemData,
                ]);
                $errors[] = [
                    'index' => $index,
                    'message' => $e->getMessage(),
                    'validation_errors' => $e->errors(),
                ];
            } catch (Throwable $e) {
                Log::error('Reading API: failed to process reading', [
                    'index' => $index,
                    'exception' => $e,
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
