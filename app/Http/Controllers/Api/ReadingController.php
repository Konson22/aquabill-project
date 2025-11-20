<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\BaseController;
use App\Models\MeterReading;
use App\Models\Meter;
use App\Models\Customer;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ReadingController extends BaseController
{
    /**
     * Display a listing of meter readings
     */
    public function index(Request $request): JsonResponse
    {
        $query = MeterReading::with(['meter.customer', 'recordedBy']);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('meter', function ($q) use ($search) {
                $q->where('meter_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($customerQuery) use ($search) {
                      $customerQuery->where('first_name', 'like', "%{$search}%")
                                   ->orWhere('last_name', 'like', "%{$search}%")
                                   ->orWhere('account_number', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by meter
        if ($request->has('meter_id')) {
            $query->where('meter_id', $request->meter_id);
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->whereHas('meter', function ($q) use ($request) {
                $q->where('customer_id', $request->customer_id);
            });
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('reading_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('reading_date', '<=', $request->date_to);
        }

        // Filter by consumption range
        if ($request->has('consumption_min')) {
            $query->where('consumption', '>=', $request->consumption_min);
        }

        if ($request->has('consumption_max')) {
            $query->where('consumption', '<=', $request->consumption_max);
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'reading_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $readings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $readings,
            'message' => 'Meter readings retrieved successfully'
        ], 200);
    }

    /**
     * Store meter reading(s) - accepts single reading or array of readings
     * 
     * For single reading, send data directly:
     * {
     *   "meter_id": 1,
     *   "date": "2024-01-15",
     *   "value": 1250.50,
     *   "illigal_connection": false,
     *   "note": "Optional note"
     * }
     * 
     * For multiple readings, wrap in 'readings' array:
     * {
     *   "readings": [
     *     {
     *       "meter_id": 1,
     *       "date": "2024-01-15",
     *       "value": 1250.50,
     *       "illigal_connection": false,
     *       "note": "Reading 1"
     *     },
     *     {
     *       "meter_id": 2,
     *       "date": "2024-01-15",
     *       "value": 2100.75,
     *       "illigal_connection": false,
     *       "note": "Reading 2"
     *     }
     *   ]
     * }
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Check if request contains array of readings
        if ($request->has('readings') && is_array($request->readings)) {
            return $this->storeMultipleReadings($request);
        }

        // Single reading validation
        $validator = Validator::make($request->all(), [
            'meter_id' => 'required|exists:meters,id',
            'date' => 'required|date',
            'value' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $reading = $this->createSingleReading($request->all());
            
            if (!$reading) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create meter reading'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Meter reading recorded successfully',
                'inserted_meter_ids' => [$reading->serial]
            ], 201);

        } catch (\Exception $e) {
            \Log::error("Error creating meter reading: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving the meter reading. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store multiple meter readings
     */
    private function storeMultipleReadings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'readings' => 'required|array|min:1|max:100', 
            'readings.*.meter_id' => 'required|exists:meters,id',
            'readings.*.date' => 'required|date',
            'readings.*.value' => 'required|numeric|min:0',
            'readings.*.note' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $createdReadings = [];
        $insertedMeterIds = [];
        $errors = [];
        $successCount = 0;

        DB::beginTransaction();

        try {
            foreach ($request->readings as $index => $readingData) {
                try {
                    $reading = $this->createSingleReading($readingData);
                    
                    if ($reading) {
                        $createdReadings[] = $reading->load(['meter.customer', 'recordedBy', 'bills']);
                        $insertedMeterIds[] = $reading->meter_id;
                        $successCount++;
                    } else {
                        $errors[] = "Row " . ($index + 1) . ": Failed to create reading";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Row " . ($index + 1) . ": " . $e->getMessage();
                    \Log::error("Error creating reading at index {$index}: " . $e->getMessage());
                }
            }

            DB::commit();

            return response()->json([
                'success' => $successCount > 0,
                'message' => "Successfully created {$successCount} meter reading(s) out of " . count($request->readings),
               
                'created_readings' => $createdReadings,
                'success_count' => $successCount,
                'total_count' => count($request->readings),
                'error_count' => count($errors),
                'errors' => $errors,
                'inserted_meter_ids' => $insertedMeterIds
            ], $successCount > 0 ? 201 : 422);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating meter readings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a single meter reading
     */
    private function createSingleReading(array $readingData)
    {
        // Get the previous reading for this meter
        $previousReading = MeterReading::where('meter_id', $readingData['meter_id'])
            ->orderBy('date', 'desc')
            ->first();

        $previousReadingValue = $previousReading ? $previousReading->value : 0;

        // Validate that current reading is not less than previous reading
        if ($previousReading && $readingData['value'] < $previousReadingValue) {
            throw new \Exception("Current reading value ({$readingData['value']}) cannot be less than the previous reading value ({$previousReadingValue})");
        }

        // Get the meter to retrieve customer_id
        $meter = Meter::find($readingData['meter_id']);
        if (!$meter) {
            throw new \Exception('Meter not found');
        }

        // Check if meter has a customer assigned
        if (!$meter->customer) {
            throw new \Exception('Meter does not have a customer assigned');
        }

        // Create the meter reading
        $reading = MeterReading::create([
            'meter_id' => $readingData['meter_id'],
            'customer_id' => $meter->customer->id,
            'value' => $readingData['value'],
            'previous' => $previousReadingValue,
            'illigal_connection' =>  0,
            'date' => $readingData['date'],
            'source' => 'mobile app',
            'note' => $readingData['note'] ?? null,
            'billing_officer' => auth()->id(),
        ]);

        // Generate bill automatically after creating reading
        if (!$reading->bills()->exists()) {
            $this->generateBillFromReading($reading);
        } else {
            \Log::info("Reading {$reading->id} already has a bill, skipping generation");
        }

        return $reading;
    }

    /**
     * Display the specified meter reading
     */
    public function show(MeterReading $reading): JsonResponse
    {
        $reading->load(['meter.customer', 'recordedBy']);

        return response()->json([
            'success' => true,
            'data' => $reading,
            'message' => 'Meter reading retrieved successfully'
        ], 200);
    }

    /**
     * Update the specified meter reading
     */
    public function update(Request $request, MeterReading $reading): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reading_date' => 'sometimes|required|date',
            'current_reading' => 'sometimes|required|numeric|min:0',
            'previous_reading' => 'nullable|numeric|min:0',
            'consumption' => 'nullable|numeric|min:0',
            'recorded_by' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check for duplicate reading on same date for same meter (excluding current reading)
        if ($request->has('reading_date') && $request->reading_date != $reading->reading_date) {
            $existingReading = MeterReading::where('meter_id', $reading->meter_id)
                ->where('reading_date', $request->reading_date)
                ->where('id', '!=', $reading->id)
                ->first();

            if ($existingReading) {
                return response()->json([
                    'success' => false,
                    'message' => 'A reading already exists for this meter on the specified date'
                ], 422);
            }
        }

        // Recalculate consumption if current_reading is updated
        if ($request->has('current_reading')) {
            $previousReading = $request->previous_reading ?? $reading->previous_reading;
            $consumption = $request->current_reading - $previousReading;
            $request->merge(['consumption' => max(0, $consumption)]);
        }

        $reading->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Meter reading updated successfully',
            'data' => $reading->load(['meter.customer', 'recordedBy'])
        ], 200);
    }

    /**
     * Remove the specified meter reading
     */
    public function destroy(MeterReading $reading): JsonResponse
    {
        $reading->delete();

        return response()->json([
            'success' => true,
            'message' => 'Meter reading deleted successfully'
        ], 200);
    }

    /**
     * Get reading statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $query = MeterReading::query();

        // Filter by date range if provided
        if ($request->has('date_from')) {
            $query->where('reading_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('reading_date', '<=', $request->date_to);
        }

        $stats = [
            'total_readings' => $query->count(),
            'total_consumption' => $query->sum('consumption'),
            'average_consumption' => $query->avg('consumption'),
            'max_consumption' => $query->max('consumption'),
            'min_consumption' => $query->min('consumption'),
            'readings_this_month' => MeterReading::whereMonth('reading_date', now()->month)->count(),
            'readings_this_year' => MeterReading::whereYear('reading_date', now()->year)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Reading statistics retrieved successfully'
        ], 200);
    }

    /**
     * Get readings for a specific meter
     */
    public function meterReadings(Meter $meter, Request $request): JsonResponse
    {
        $query = $meter->readings();

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('reading_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('reading_date', '<=', $request->date_to);
        }

        $readings = $query->orderBy('reading_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $readings,
            'message' => 'Meter readings retrieved successfully'
        ], 200);
    }

    /**
     * Get readings for a specific customer
     */
    public function customerReadings(Customer $customer, Request $request): JsonResponse
    {
        $query = MeterReading::whereHas('meter', function ($q) use ($customer) {
            $q->where('customer_id', $customer->id);
        })->with(['meter', 'recordedBy']);

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('reading_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('reading_date', '<=', $request->date_to);
        }

        $readings = $query->orderBy('reading_date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $readings,
            'message' => 'Customer readings retrieved successfully'
        ], 200);
    }

    /**
     * Bulk import readings
     */
    public function bulkImport(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'readings' => 'required|array',
            'readings.*.meter_id' => 'required|exists:meters,id',
            'readings.*.reading_date' => 'required|date',
            'readings.*.current_reading' => 'required|numeric|min:0',
            'readings.*.previous_reading' => 'nullable|numeric|min:0',
            'readings.*.consumption' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $imported = 0;
        $skipped = 0;
        $errors = [];

        DB::beginTransaction();

        try {
            foreach ($request->readings as $index => $readingData) {
                // Check for duplicate reading
                $existingReading = MeterReading::where('meter_id', $readingData['meter_id'])
                    ->where('reading_date', $readingData['reading_date'])
                    ->first();

                if ($existingReading) {
                    $skipped++;
                    $errors[] = "Row " . ($index + 1) . ": Reading already exists for this meter on the specified date";
                    continue;
                }

                // Get previous reading if not provided
                if (!isset($readingData['previous_reading'])) {
                    $lastReading = MeterReading::where('meter_id', $readingData['meter_id'])
                        ->orderBy('reading_date', 'desc')
                        ->first();
                    
                    $readingData['previous_reading'] = $lastReading ? $lastReading->current_reading : 0;
                }

                // Calculate consumption if not provided
                if (!isset($readingData['consumption'])) {
                    $readingData['consumption'] = max(0, $readingData['current_reading'] - $readingData['previous_reading']);
                }

                // Set recorded_by to current user
                $readingData['recorded_by'] = auth()->id();

                MeterReading::create($readingData);
                $imported++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Readings imported successfully',
                'data' => [
                    'imported' => $imported,
                    'skipped' => $skipped,
                    'errors' => $errors
                ]
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get reading trends for a meter
     */
    public function trends(Meter $meter, Request $request): JsonResponse
    {
        $period = $request->get('period', 'monthly'); // monthly, quarterly, yearly
        $limit = $request->get('limit', 12);

        $query = $meter->readings();

        switch ($period) {
            case 'monthly':
                $readings = $query->selectRaw('
                    YEAR(reading_date) as year,
                    MONTH(reading_date) as month,
                    SUM(consumption) as total_consumption,
                    AVG(consumption) as avg_consumption,
                    COUNT(*) as readings_count
                ')
                ->groupBy('year', 'month')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->limit($limit)
                ->get();
                break;

            case 'quarterly':
                $readings = $query->selectRaw('
                    YEAR(reading_date) as year,
                    QUARTER(reading_date) as quarter,
                    SUM(consumption) as total_consumption,
                    AVG(consumption) as avg_consumption,
                    COUNT(*) as readings_count
                ')
                ->groupBy('year', 'quarter')
                ->orderBy('year', 'desc')
                ->orderBy('quarter', 'desc')
                ->limit($limit)
                ->get();
                break;

            case 'yearly':
                $readings = $query->selectRaw('
                    YEAR(reading_date) as year,
                    SUM(consumption) as total_consumption,
                    AVG(consumption) as avg_consumption,
                    COUNT(*) as readings_count
                ')
                ->groupBy('year')
                ->orderBy('year', 'desc')
                ->limit($limit)
                ->get();
                break;

            default:
                $readings = collect();
        }

        return response()->json([
            'success' => true,
            'data' => $readings,
            'message' => 'Reading trends retrieved successfully'
        ], 200);
    }

    /**
     * Generate a bill from a meter reading.
     */
    private function generateBillFromReading(MeterReading $reading)
    {
        try {
            // Validate reading has required data
            if ($reading->value <= $reading->previous) {
                \Log::warning("Cannot generate bill: Invalid reading values for reading {$reading->id}");
                return null;
            }

            // Get the meter with customer and category
            $meter = $reading->meter()->with(['customer.category'])->first();
            
            if (!$meter || !$meter->customer) {
                \Log::warning("Cannot generate bill: Meter or customer not found for reading {$reading->id}");
                return null;
            }

            $customer = $meter->customer;
            $category = $customer->category;
            
            // Calculate consumption
            $consumption = $reading->value - $reading->previous;

            \Log::info("Processing bill generation for reading {$reading->id}, consumption {$consumption}");

            // Get the previous balance from the last bill for this customer
            $lastBill = Bill::where('customer_id', $customer->id)
                ->orderBy('created_at', 'desc')
                ->first();
            
            $prevBalance = $lastBill ? $lastBill->current_balance : 0.00;

            // If the last bill has an outstanding balance, mark it as balance_forwarded
            if ($lastBill && $lastBill->hasBalanceToForward()) {
                $lastBill->markAsBalanceForwarded();
                \Log::info("Marked previous bill {$lastBill->id} as balance_forwarded", [
                    'bill_id' => $lastBill->id,
                    'balance_forwarded' => $lastBill->getBalanceToForward()
                ]);
            }

            \Log::info("Previous balance for customer {$customer->id}: {$prevBalance}", [
                'customer_id' => $customer->id,
                'last_bill_id' => $lastBill ? $lastBill->id : 'none',
                'last_bill_current_balance' => $lastBill ? $lastBill->current_balance : 0,
                'prev_balance' => $prevBalance
            ]);

            // If no category or tariff system, do not create bill
            if (!$category) {
                \Log::warning("Cannot generate bill: No category or tariff system found for customer {$customer->id} (reading {$reading->id})");
                return null;
            }

            // Validate category has required tariff information
            if (!$category->tariff || $category->tariff <= 0) {
                \Log::warning("Cannot generate bill: Invalid tariff information for category {$category->id} (customer {$customer->id}, reading {$reading->id})");
                return null;
            }

            // Use category-based pricing
            $unitPrice = $category->tariff;
            $fixedCharge = $category->fixed_charge ?? 0.00;
            
            // Calculate total amount including previous balance
            $consumptionCharge = $consumption * $unitPrice;
            $totalAmount = $consumptionCharge + $fixedCharge + $prevBalance;

            // Create the bill
            $bill = Bill::create([
                'customer_id' => $customer->id,
                'meter_id' => $meter->id,
                'reading_id' => $reading->id,
                'billing_period_start' => $this->calculateBillingPeriodStart($reading->date),
                'billing_period_end' => $reading->date,
                'prev_balance' => $prevBalance,
                'consumption' => $consumption,
                'unit_price' => $unitPrice,
                'fixed_charge' => $fixedCharge,
                'other_charge' => 0.00,
                'total_amount' => $totalAmount,
                'current_balance' => $totalAmount, // Total + previous balance
                'status' => 'unpaid',
                'generated_by' => auth()->id(),
            ]);

            \Log::info("Bill created successfully using category pricing", [
                'bill_id' => $bill->id,
                'reading_id' => $reading->id,
                'category_id' => $category->id,
                'unit_price' => $unitPrice,
                'fixed_charge' => $fixedCharge,
                'prev_balance' => $prevBalance,
                'total_amount' => $totalAmount,
                'current_balance' => $bill->current_balance
            ]);

            return $bill;

        } catch (\Exception $e) {
            \Log::error("Error generating bill for reading {$reading->id}: " . $e->getMessage());
            \Log::error("Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    /**
     * Calculate the billing period start date based on the reading date.
     * Assumes monthly billing cycles.
     */
    private function calculateBillingPeriodStart($readingDate)
    {
        $date = \Carbon\Carbon::parse($readingDate);
        
        // If reading is in the first half of the month, bill for current month
        // If reading is in the second half, bill for previous month
        if ($date->day <= 15) {
            return $date->startOfMonth();
        } else {
            return $date->subMonth()->startOfMonth();
        }
    }
}
