<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MeterReading;
use App\Models\Meter;
use App\Models\Customer;
use App\Models\User;
use App\Models\Bill;
use App\Http\Requests\MeterReadingRequest;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class MeterReadingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $readings = MeterReading::with(['meter.customer', 'recordedBy', 'bills'])
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($reading) {
                return [
                    'id' => $reading->id,
                    'meter_id' => $reading->meter_id,
                    'value' => $reading->value,
                    'previous' => $reading->previous,
                    'consumption' => $reading->consumption,
                    'date' => $reading->date,
                    'source' => $reading->source,
                    'billing_officer' => $reading->billing_officer,
                    'created_at' => $reading->created_at,
                    'bills' => $reading->bills->map(function ($bill) {
                        return [
                            'id' => $bill->id,
                            'status' => $bill->status,
                            'total_amount' => $bill->total_amount,
                            'current_balance' => $bill->current_balance,
                        ];
                    }),
                    'meter' => [
                        'id' => $reading->meter->id,
                        'serial' => $reading->meter->serial,
                        'customer' => $reading->meter->customer ? [
                            'id' => $reading->meter->customer->id,
                            'first_name' => $reading->meter->customer->first_name,
                            'last_name' => $reading->meter->customer->last_name,
                            'account_number' => $reading->meter->customer->account_number,
                        ] : null,
                    ],
                    'recorded_by' => $reading->recordedBy ? [
                        'id' => $reading->recordedBy->id,
                        'name' => $reading->recordedBy->name,
                    ] : null,
                ];
            });

        $stats = [
            'total_readings' => MeterReading::count(),
            'this_month' => MeterReading::whereMonth('date', now()->month)->count(),
            'total_consumption' => MeterReading::get()->sum(function($reading) {
                return $reading->value - $reading->previous;
            }),
            'avg_consumption' => MeterReading::get()->avg(function($reading) {
                return $reading->value - $reading->previous;
            }),
        ];

        // Only include meters that are assigned to customers for AddReadingModal
        $meters = Meter::with('customer')->whereHas('customer')->get()->map(function ($meter) {
            // Get the latest reading for this meter
            $latestReading = MeterReading::where('meter_id', $meter->id)
                ->orderBy('date', 'desc')
                ->first();
            
            return [
                'id' => $meter->id,
                'serial' => $meter->serial,
                'name' => $meter->serial . ' - ' . ($meter->customer ? 
                    $meter->customer->first_name . ' ' . $meter->customer->last_name : ''),
                'previous_reading' => $latestReading ? $latestReading->value : 0,
                'customer' => $meter->customer ? [
                    'id' => $meter->customer->id,
                    'first_name' => $meter->customer->first_name,
                    'last_name' => $meter->customer->last_name,
                    'account_number' => $meter->customer->account_number,
                ] : null,
            ];
        });

        $customers = Customer::all();

        return Inertia::render('readings/index', compact(
            'readings',
            'stats',
            'meters',
            'customers'
        ));
    }

    /**
     * Display readings statistics and analytics.
     */
    public function statistics(Request $request)
    {
        try {
            // Get filter parameters
            $filters = [
                'month' => $request->get('month'),
                'year' => $request->get('year', now()->year),
                'category' => $request->get('category'),
                'neighborhood' => $request->get('neighborhood'),
            ];
            

            // Build base query with filters
            $baseQuery = MeterReading::query();

            // Apply date filters
            if ($filters['month']) {
                $baseQuery->whereMonth('date', $filters['month']);
            }
            if ($filters['year']) {
                $baseQuery->whereYear('date', $filters['year']);
            }

            // Apply customer category filter
            if ($filters['category']) {
                $baseQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('category_id', $filters['category']);
                });
            }

            // Apply neighborhood filter
            if ($filters['neighborhood']) {
                $baseQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('neighborhood_id', $filters['neighborhood']);
                });
            }

            // Get filtered readings
            $filteredReadings = $baseQuery->get();

            // Overall statistics
            $totalReadings = $filteredReadings->count();
            // Calculate this month's readings with proper filtering
            $thisMonthQuery = MeterReading::whereMonth('date', now()->month)
                ->whereYear('date', now()->year);
                
            if ($filters['category']) {
                $thisMonthQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('category_id', $filters['category']);
                });
            }
            if ($filters['neighborhood']) {
                $thisMonthQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('neighborhood_id', $filters['neighborhood']);
                });
            }
            
            $thisMonth = $thisMonthQuery->count();
            
            $consumptionData = $filteredReadings->map(function($reading) {
                return $reading->value - $reading->previous;
            });
            
            $totalConsumption = $consumptionData->sum();
            $avgConsumption = $consumptionData->avg();
            $highestConsumption = $consumptionData->max();
            $lowestConsumption = $consumptionData->min();
            
            $activeCustomers = $filteredReadings->pluck('meter.customer.id')->unique()->count();
            
            // Get bills generated with filters
            $billsQuery = Bill::query();
            if ($filters['month']) {
                $billsQuery->whereMonth('created_at', $filters['month']);
            }
            if ($filters['year']) {
                $billsQuery->whereYear('created_at', $filters['year']);
            }
            if ($filters['category']) {
                $billsQuery->whereHas('reading.meter.customer', function($query) use ($filters) {
                    $query->where('category_id', $filters['category']);
                });
            }
            if ($filters['neighborhood']) {
                $billsQuery->whereHas('reading.meter.customer', function($query) use ($filters) {
                    $query->where('neighborhood_id', $filters['neighborhood']);
                });
            }
            $billsGenerated = $billsQuery->count();

        $statistics = [
            'total_readings' => $totalReadings,
            'this_month' => $thisMonth,
            'total_consumption' => $totalConsumption,
            'avg_consumption' => $avgConsumption,
            'highest_consumption' => $highestConsumption,
            'lowest_consumption' => $lowestConsumption,
            'active_customers' => $activeCustomers,
            'bills_generated' => $billsGenerated,
        ];

        // Monthly data for the last 12 months
        $monthlyData = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
                $monthQuery = MeterReading::whereMonth('date', $date->month)
                    ->whereYear('date', $date->year);

                // Apply category filter to monthly data
                if ($filters['category']) {
                    $monthQuery->whereHas('meter.customer', function($query) use ($filters) {
                        $query->where('category_id', $filters['category']);
                    });
                }

                // Apply neighborhood filter to monthly data
                if ($filters['neighborhood']) {
                    $monthQuery->whereHas('meter.customer', function($query) use ($filters) {
                        $query->where('neighborhood_id', $filters['neighborhood']);
                    });
                }

                $monthReadings = $monthQuery->get();
            
            $monthConsumption = $monthReadings->sum(function($reading) {
                return $reading->value - $reading->previous;
            });
            
            $monthlyData->push([
                'month' => $date->format('M Y'),
                'readings' => $monthReadings->count(),
                'consumption' => $monthConsumption,
                'average' => $monthReadings->count() > 0 ? $monthConsumption / $monthReadings->count() : 0,
            ]);
        }

        // Source distribution
            $sourceQuery = MeterReading::selectRaw('source, COUNT(*) as count')
                ->groupBy('source');

            // Apply filters to source data
            if ($filters['month']) {
                $sourceQuery->whereMonth('date', $filters['month']);
            }
            if ($filters['year']) {
                $sourceQuery->whereYear('date', $filters['year']);
            }
            if ($filters['category']) {
                $sourceQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('category_id', $filters['category']);
                });
            }
            if ($filters['neighborhood']) {
                $sourceQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('neighborhood_id', $filters['neighborhood']);
                });
            }

            $sourceData = $sourceQuery->get()
            ->map(function($item) use ($totalReadings) {
                $source = $item->source ?: 'manual';
                return [
                    'name' => ucfirst($source),
                    'value' => $item->count,
                        'percentage' => $totalReadings > 0 ? round(($item->count / $totalReadings) * 100, 1) : 0,
                ];
            });

        // Consumption trends (monthly averages vs totals)
        $consumptionTrends = $monthlyData->map(function($month) {
            return [
                'month' => $month['month'],
                'average' => $month['average'],
                'total' => $month['consumption'],
            ];
        });

        // Top customers by consumption
            $topCustomersQuery = MeterReading::with('meter.customer');

            // Apply filters to top customers
            if ($filters['month']) {
                $topCustomersQuery->whereMonth('date', $filters['month']);
            }
            if ($filters['year']) {
                $topCustomersQuery->whereYear('date', $filters['year']);
            }
            if ($filters['category']) {
                $topCustomersQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('category_id', $filters['category']);
                });
            }
            if ($filters['neighborhood']) {
                $topCustomersQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('neighborhood_id', $filters['neighborhood']);
                });
            }

            $topCustomers = $topCustomersQuery->get()
                ->groupBy('meter.customer.id')
            ->map(function($readings, $customerId) {
                $customer = $readings->first()->meter->customer;
                $totalConsumption = $readings->sum(function($reading) {
                    return $reading->value - $reading->previous;
                });
                
                return [
                    'id' => $customerId,
                    'name' => $customer ? $customer->first_name . ' ' . $customer->last_name : 'Unknown',
                    'account_number' => $customer ? $customer->account_number : 'N/A',
                    'total_consumption' => $totalConsumption,
                    'readings_count' => $readings->count(),
                ];
            })
            ->sortByDesc('total_consumption')
            ->take(10)
            ->values();

        // Recent readings
            $recentReadingsQuery = MeterReading::with(['meter.customer', 'recordedBy'])
            ->orderBy('date', 'desc')
                ->take(10);

            // Apply filters to recent readings
            if ($filters['month']) {
                $recentReadingsQuery->whereMonth('date', $filters['month']);
            }
            if ($filters['year']) {
                $recentReadingsQuery->whereYear('date', $filters['year']);
            }
            if ($filters['category']) {
                $recentReadingsQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('category_id', $filters['category']);
                });
            }
            if ($filters['neighborhood']) {
                $recentReadingsQuery->whereHas('meter.customer', function($query) use ($filters) {
                    $query->where('neighborhood_id', $filters['neighborhood']);
                });
            }

            $recentReadings = $recentReadingsQuery->get()
            ->map(function ($reading) {
                return [
                    'id' => $reading->id,
                    'date' => $reading->date,
                    'consumption' => $reading->consumption,
                    'source' => $reading->source,
                    'meter' => [
                        'serial' => $reading->meter->serial,
                        'customer' => $reading->meter->customer ? [
                            'first_name' => $reading->meter->customer->first_name,
                            'last_name' => $reading->meter->customer->last_name,
                            'account_number' => $reading->meter->customer->account_number,
                        ] : null,
                    ],
                ];
            });

            // Get categories and neighborhoods for filter dropdowns
            $categories = \App\Models\Category::orderBy('name')->get();
            $neighborhoods = \App\Models\Neighborhood::orderBy('name')->get();

            // Calculate consumption by category
            $categoryConsumption = [];
            foreach ($categories as $category) {
                $categoryQuery = MeterReading::whereHas('meter.customer', function($query) use ($category) {
                    $query->where('category_id', $category->id);
                });

                // Apply same filters as main query
                if ($filters['month']) {
                    $categoryQuery->whereMonth('date', $filters['month']);
                }
                if ($filters['year']) {
                    $categoryQuery->whereYear('date', $filters['year']);
                }
                if ($filters['neighborhood']) {
                    $categoryQuery->whereHas('meter.customer', function($query) use ($filters) {
                        $query->where('neighborhood_id', $filters['neighborhood']);
                    });
                }

                $categoryReadings = $categoryQuery->get();
                $categoryTotalConsumption = $categoryReadings->sum(function($reading) {
                    return $reading->value - $reading->previous;
                });
                $categoryReadingsCount = $categoryReadings->count();
                $categoryAvgConsumption = $categoryReadingsCount > 0 ? $categoryTotalConsumption / $categoryReadingsCount : 0;

                $categoryConsumption[] = [
                    'category_name' => $category->name,
                    'readings_count' => $categoryReadingsCount,
                    'total_consumption' => $categoryTotalConsumption,
                    'average_consumption' => $categoryAvgConsumption,
                    'percentage_of_total' => $totalConsumption > 0 ? round(($categoryTotalConsumption / $totalConsumption) * 100, 2) : 0,
                ];
            }

            return Inertia::render('readings/statistics', compact(
                'statistics',
                'monthlyData',
                'sourceData',
                'consumptionTrends',
                'topCustomers',
                'recentReadings',
                'categories',
                'neighborhoods',
                'filters',
                'categoryConsumption'
            ));
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('Statistics page error: ' . $e->getMessage());
            
            // Return a simple error page or redirect back with error
            return redirect()->back()->with('error', 'Unable to load statistics. Please try again later.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Only show meters that have customers assigned
        $meters = Meter::with('customer')->whereHas('customer')->get();

        return Inertia::render('readings/create', compact('meters'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MeterReadingRequest $request)
    {

        try {
            // Get the previous reading for this meter
            $previousReading = MeterReading::where('meter_id', $request->meter_id)
                ->orderBy('date', 'desc')
                ->first();

            $previousReadingValue = $previousReading ? $previousReading->value : 0;

            // Get the meter to retrieve customer_id
            $meter = Meter::find($request->meter_id);
            if (!$meter) {
                throw new \Exception('Meter not found');
            }

            // Check if meter has a customer assigned
            if (!$meter->customer) {
                throw new \Exception('Meter does not have a customer assigned');
            }

            // Create the meter reading
            $reading = MeterReading::create([
                'meter_id' => $request->meter_id,
                'customer_id' => $meter->customer->id,
                'value' => $request->value,
                'previous' => $previousReadingValue,
                'illigal_connection' => $request->illigal_connection ?? 0,
                'date' => $request->date,
                'source' => $request->source,
                'note' => $request->note,
                'billing_officer' => auth()->id(),
            ]);

           

            // Generate bill automatically after creating reading
            $bill = null;
            if (!$reading->bills()->exists()) {
                $bill = $this->generateBillFromReading($reading);
            } else {
                \Log::info("Reading {$reading->id} already has a bill, skipping generation");
            }

            $successMessage = 'Meter reading recorded successfully';
            if ($bill) {
                $successMessage .= ' and bill generated.';
            } else {
                if ($reading->bills()->exists()) {
                    $successMessage .= '. Bill already exists for this reading.';
                } else {
                    $successMessage .= '. Bill generation will be processed separately.';
                }
            }

            return redirect()->route('readings.index')
                ->with('success', $successMessage);

        } catch (\Exception $e) {
           dd($e->getMessage());

            return back()->withErrors([
                'general' => 'An error occurred while saving the meter reading. Please try again.'
            ])->withInput();
        }
    }

    /**
     * Generate a bill from a meter reading.
     */
    private function generateBillFromReading(MeterReading $reading)
    {
        try {
            // Validate reading has required data
            if ($reading->value <= $reading->previous) {
                return null;
            }

            // Get the meter with customer and category
            $meter = $reading->meter()->with(['customer.category'])->first();
            
            if (!$meter || !$meter->customer) {
                return null;
            }

            $customer = $meter->customer;
            $category = $customer->category;
            
            // Calculate consumption
            $consumption = $reading->value - $reading->previous;

            // Get the previous balance from the last bill for this customer
            $lastBill = Bill::where('customer_id', $customer->id)
                ->orderBy('created_at', 'desc')
                ->first();
            
            $prevBalance = $lastBill ? $lastBill->current_balance : 0.00;

            // If the last bill has an outstanding balance, mark it as balance_forwarded
            if ($lastBill && $lastBill->hasBalanceToForward()) {
                $lastBill->markAsBalanceForwarded();
            }


            // If no category or tariff system, do not create bill
            if (!$category) {
                return null;
            }

            // Validate category has required tariff information
            if (!$category->tariff || $category->tariff <= 0) {
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

    /**
     * Manually generate bills for readings that don't have bills yet.
     */
    public function generateMissingBills()
    {
        $readingsWithoutBills = MeterReading::whereDoesntHave('bills')
            ->with(['meter.customer.category'])
            ->get();

        $generatedCount = 0;
        $errors = [];
        $warnings = [];

        foreach ($readingsWithoutBills as $reading) {
            try {
                $bill = $this->generateBillFromReading($reading);
                if ($bill) {
                    $generatedCount++;
                    \Log::info("Successfully generated bill {$bill->id} for reading {$reading->id}");
                } else {
                    $errors[] = "Failed to generate bill for reading ID: {$reading->id} - Meter or customer not found";
                }
            } catch (\Exception $e) {
                $errors[] = "Error generating bill for reading ID: {$reading->id}: " . $e->getMessage();
                \Log::error("Error in generateMissingBills for reading {$reading->id}: " . $e->getMessage());
            }
        }

        $message = "Generated {$generatedCount} bills successfully.";
        if (count($errors) > 0) {
            $message .= " " . count($errors) . " bills failed to generate.";
        }

        return redirect()->route('readings.index')
            ->with('success', $message)
            ->with('errors', $errors);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $reading = MeterReading::with(['meter.customer', 'recordedBy', 'bills'])
            ->findOrFail($id);

        return Inertia::render('readings/show', compact('reading'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $reading = MeterReading::with(['meter.customer', 'recordedBy'])
            ->findOrFail($id);
        
        $meters = Meter::with('customer')->get();

        return Inertia::render('readings/edit', compact('reading', 'meters'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MeterReadingRequest $request, string $id)
    {
        $reading = MeterReading::findOrFail($id);

        try {
            // Get the previous reading for this meter (excluding current reading)
            $previousReading = MeterReading::where('meter_id', $request->meter_id)
                ->where('id', '!=', $id)
                ->orderBy('date', 'desc')
                ->first();

            $previousReadingValue = $previousReading ? $previousReading->value : 0;

            $reading->update([
                'meter_id' => $request->meter_id,
                'date' => $request->date,
                'previous' => $previousReadingValue,
                'value' => $request->value,
                'source' => $request->source,
                'billing_officer' => $request->billing_officer, // Automatically set by form request
            ]);

            // Log the successful update
            \Log::info("Meter reading updated successfully", [
                'reading_id' => $reading->id,
                'meter_id' => $reading->meter_id,
                'value' => $reading->value,
                'previous' => $reading->previous,
                'consumption' => $reading->consumption,
                'date' => $reading->date,
                'billing_officer' => $reading->billing_officer,
                'source' => $reading->source,
            ]);

            return redirect()->route('readings.index')
                ->with('success', 'Meter reading updated successfully.');

        } catch (\Exception $e) {
            \Log::error("Error updating meter reading", [
                'reading_id' => $id,
                'error' => $e->getMessage(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'general' => 'An error occurred while updating the meter reading. Please try again.'
            ])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $reading = MeterReading::findOrFail($id);
        $reading->delete();

        return redirect()->route('readings.index')
            ->with('success', 'Meter reading deleted successfully.');
    }

    /**
     * Get readings for a specific meter.
     */
    public function meterReadings($meterId)
    {
        $readings = MeterReading::where('meter_id', $meterId)
            ->orderBy('date', 'desc')
            ->get();

        $meter = Meter::findOrFail($meterId);

        return Inertia::render('readings/meter-readings', compact('readings', 'meter'));
    }

    /**
     * Get readings for a specific customer.
     */
    public function customerReadings($customerId)
    {
        $customer = Customer::with('meter.readings')->findOrFail($customerId);
        
        return Inertia::render('readings/customer-readings', compact('customer'));
    }

    /**
     * Test method to check database state and debug bill generation.
     */
    public function testBillGeneration()
    {
        $results = [];
        
        // Check if we have categories
        $categories = \App\Models\Category::count();
        $results['categories_count'] = $categories;
        
        // Check if we have customers with categories
        $customersWithCategories = \App\Models\Customer::whereNotNull('category_id')->count();
        $results['customers_with_categories'] = $customersWithCategories;
        
        // Check if we have readings
        $readings = \App\Models\MeterReading::count();
        $results['readings_count'] = $readings;
        
        // Check if we have bills
        $bills = \App\Models\Bill::count();
        $results['bills_count'] = $bills;
        
        // Get a sample reading
        $sampleReading = \App\Models\MeterReading::with(['meter'])->first();
        if ($sampleReading) {
            $results['sample_reading_id'] = $sampleReading->id;
            $results['sample_reading_consumption'] = $sampleReading->value - $sampleReading->previous;
        }
        
        return response()->json($results);
    }

    /**
     * Test method to create a sample reading.
     */
    public function testCreateReading()
    {
        try {
            // Get a customer
            $customer = \App\Models\Customer::first();
            if (!$customer) {
                return response()->json(['error' => 'No customer found']);
            }

            // Get a meter
            $meter = \App\Models\Meter::first();
            if (!$meter) {
                return response()->json(['error' => 'No meter found']);
            }

            // Create a test reading
            $reading = \App\Models\MeterReading::create([
                'meter_id' => $meter->id,
                'date' => now(),
                'value' => 50,
                'previous' => 0,
            ]);

            return response()->json([
                'success' => true,
                'reading_id' => $reading->id,
                'customer_id' => $customer->id,
                'meter_id' => $meter->id,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Test method to manually create a bill for testing.
     */
    public function testCreateBill()
    {
        try {
            // Check if we have any meter readings
            $reading = MeterReading::first();
            if (!$reading) {
                return response()->json([
                    'error' => 'No meter readings found. Please create a meter reading first.'
                ], 400);
            }

            // Check if this reading already has a bill
            if ($reading->bills()->exists()) {
                return response()->json([
                    'message' => 'Reading already has a bill',
                    'reading_id' => $reading->id,
                    'bill_id' => $reading->bills()->first()->id
                ]);
            }

            // Try to generate a bill
            $result = $this->generateBillFromReading($reading);
            
            if ($result) {
                return response()->json([
                    'message' => 'Bill created successfully',
                    'reading_id' => $reading->id,
                    'bill_id' => $reading->bills()->first()->id,
                    'total_bills' => Bill::count()
                ]);
            } else {
                return response()->json([
                    'error' => 'Failed to create bill',
                    'reading_id' => $reading->id
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Get bills for a specific reading.
     */
    public function readingBills($readingId)
    {
        $reading = MeterReading::with(['bills.customer', 'bills.meter'])->findOrFail($readingId);
        
        return response()->json([
            'reading' => [
                'id' => $reading->id,
                'meter_id' => $reading->meter_id,
                'value' => $reading->value,
                'previous' => $reading->previous,
                'consumption' => $reading->consumption,
                'date' => $reading->date,
            ],
            'bills' => $reading->bills->map(function ($bill) {
                return [
                    'id' => $bill->id,
                    'customer_id' => $bill->customer_id,
                    'meter_id' => $bill->meter_id,
                    'billing_period_start' => $bill->billing_period_start,
                    'billing_period_end' => $bill->billing_period_end,
                    'consumption' => $bill->consumption,
                    'unit_price' => $bill->unit_price,
                    'fixed_charge' => $bill->fixed_charge,
                    'total_amount' => $bill->total_amount,
                    'status' => $bill->status,
                    'created_at' => $bill->created_at,
                ];
            }),
            'bill_count' => $reading->bills->count(),
        ]);
    }
}
