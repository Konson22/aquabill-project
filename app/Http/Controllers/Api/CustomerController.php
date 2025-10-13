<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\Neighborhood;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers whose last reading was not recorded in current month
     */
    public function index(Request $request): JsonResponse
    {
        $currentMonth = now()->format('Y-m');
        
        $customers = Customer::with([
            'category',
            'neighborhood',
            'meter',
            'readings' => function ($query) {
                $query->latest()->limit(1);
            },
            'bills' => function ($query) {
                $query->latest()->limit(1);
            },
        ])->whereNotNull('meter_id')
        ->whereDoesntHave('readings', function ($query) use ($currentMonth) {
            $query->whereRaw('DATE_FORMAT(created_at, "%Y-%m") = ?', [$currentMonth]);
        })
        ->orWhereHas('readings', function ($query) {
            $query->whereNull('created_at');
        })
        ->get()
        ->filter(function ($customer) use ($currentMonth) {
            $last_reading = $customer->readings->first();
            if (!$last_reading) {
                return true; // Include customers with no readings
            }
            // Include customers whose last reading is not from current month
            return $last_reading->created_at->format('Y-m') !== $currentMonth;
        })
        ->map(function ($customer) {
            $last_reading = $customer->readings->first();
            $last_bill = $customer->bills->first();
            $customer = [
                'id' => $customer->id,
                'first_name' => $customer->first_name,
                'last_name' => $customer->last_name,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'plot_number' => $customer->plot_number,
                'latitude' => $customer->latitude,
                'longitude' => $customer->longitude,
                'is_active' => $customer->is_active,
                'category_name' => $customer->category ? $customer->category->name : null,  
                'meter_id' => $customer->meter_id,
                'tariff' => $customer->category ? $customer->category->tariff : null,  
                'fixed_charge' => $customer->category ? $customer->category->fixed_charge : null,  
                'neighborhood' => $customer->neighborhood ? $customer->neighborhood->name : null,
                'meter_serial' => $customer->meter ? $customer->meter->serial : null,
                'meter_status' => $customer->meter ? $customer->meter->status : null,
                'latest_reading' => $last_reading ? $last_reading->value : 0,
                'latest_reading_date' => $last_reading ? $last_reading->created_at : null,
                'last_bill_balance' => $last_bill ? $last_bill->current_balance : 0,
                'last_bill_date' => $last_bill ? $last_bill->billing_period_end : null,
                'last_bill_status' => $last_bill ? $last_bill->status : null,
            ];
            return $customer;
        });

        return response()->json($customers->values(), 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created customer
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'plot_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:customers',
            'account_number' => 'nullable|string|max:255|unique:customers',
            'neighborhood_id' => 'nullable|exists:neighborhoods,id',
            'category_id' => 'nullable|exists:categories,id',
            'contract' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'credit' => 'nullable|numeric|min:0',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Generate account number if not provided
        if (!$request->account_number) {
            $request->merge([
                'account_number' => 'ACC' . str_pad(Customer::count() + 1, 5, '0', STR_PAD_LEFT)
            ]);
        }

        $customer = Customer::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Customer created successfully',
            'data' => $customer->load(['neighborhood', 'category'])
        ], 201);
    }

    /**
     * Display the specified customer
     */
    public function show(Customer $customer): JsonResponse
    {
        $customer->load([
            'neighborhood', 
            'category', 
            'meter', 
            'bills' => function ($query) {
                $query->latest()->limit(1);
            }
        ]);

        $last_bill = $customer->bills->first();
        
        $customerData = $customer->toArray();
        $customerData['last_bill_balance'] = $last_bill ? $last_bill->current_balance : 0;
        $customerData['last_bill_date'] = $last_bill ? $last_bill->billing_period_end : null;
        $customerData['last_bill_status'] = $last_bill ? $last_bill->status : null;

        return response()->json([
            'success' => true,
            'data' => $customerData,
            'message' => 'Customer retrieved successfully'
        ], 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified customer
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'plot_number' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('customers')->ignore($customer->id)
            ],
            'account_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('customers')->ignore($customer->id)
            ],
            'neighborhood_id' => 'nullable|exists:neighborhoods,id',
            'category_id' => 'nullable|exists:categories,id',
            'contract' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'credit' => 'nullable|numeric|min:0',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Customer updated successfully',
            'data' => $customer->load(['neighborhood', 'category'])
        ], 200);
    }

    /**
     * Remove the specified customer
     */
    public function destroy(Customer $customer): JsonResponse
    {
        try {
            // Permanently delete the customer from database
            // All related records (invoices, bills, payments, readings, meter logs) 
            // will be automatically deleted due to cascade foreign key constraints
            $customer->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'Customer and all associated records permanently deleted successfully'
            ], 200);
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle foreign key constraint violations
            if ($e->getCode() == 23000) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete customer. This customer has associated records that must be removed first.'
                ], 422);
            }
            
            // Handle other database errors
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the customer. Please try again.'
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred. Please try again.'
            ], 500);
        }
    }

    /**
     * Get customer statistics
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total_customers' => Customer::count(),
            'active_customers' => Customer::where('is_active', true)->count(),
            'inactive_customers' => Customer::where('is_active', false)->count(),
            'customers_with_balance' => Customer::whereHas('bills', function ($query) {
                $query->where('status', '!=', 'paid');
            })->count(),
            'customers_by_neighborhood' => Neighborhood::withCount('customers')->get(),
            'customers_by_category' => Category::withCount('customers')->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
            'message' => 'Customer statistics retrieved successfully'
        ], 200);
    }

    /**
     * Get customer's bills
     */
    public function bills(Customer $customer): JsonResponse
    {
        $bills = $customer->bills()
            ->with(['meter', 'reading'])
            ->orderBy('billing_period_end', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $bills,
            'message' => 'Customer bills retrieved successfully'
        ], 200);
    }

    /**
     * Get customer's payments
     */
    public function payments(Customer $customer): JsonResponse
    {
        $payments = $customer->payments()
            ->with(['invoice.bill', 'receivedBy'])
            ->orderBy('payment_date', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $payments,
            'message' => 'Customer payments retrieved successfully'
        ], 200);
    }

    /**
     * Get customer's current balance
     */
    public function balance(Customer $customer): JsonResponse
    {
        $last_bill = $customer->bills()->latest()->first();
        
        $balance = [
            'current_balance' => $customer->current_balance,
            'last_bill_balance' => $last_bill ? $last_bill->current_balance : 0,
            'last_bill_date' => $last_bill ? $last_bill->billing_period_end : null,
            'last_bill_status' => $last_bill ? $last_bill->status : null,
            'unpaid_bills_count' => $customer->unpaid_bills->count(),
            'total_bills' => $customer->bills()->count(),
            'total_payments' => $customer->payments()->sum('amount_paid'),
        ];

        return response()->json([
            'success' => true,
            'data' => $balance,
            'message' => 'Customer balance retrieved successfully'
        ], 200);
    }

    /**
     * Bulk update customer status
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_ids' => 'required|array',
            'customer_ids.*' => 'exists:customers,id',
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        Customer::whereIn('id', $request->customer_ids)
            ->update(['is_active' => $request->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Customer status updated successfully'
        ], 200);
    }

    /**
     * Clean up customers with non-existent meters
     */
    public function cleanupOrphanedMeters(): JsonResponse
    {
        $customersWithOrphanedMeters = Customer::whereNotNull('meter_id')
            ->whereDoesntHave('meter')
            ->get();

        $cleanedCount = 0;
        foreach ($customersWithOrphanedMeters as $customer) {
            $customer->update(['meter_id' => null]);
            $cleanedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Cleaned up {$cleanedCount} customers with orphaned meter references",
            'cleaned_count' => $cleanedCount
        ], 200);
    }

    /**
     * Assign a meter to a customer
     */
    public function assignMeter(Request $request, Customer $customer): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'meter_id' => 'required|exists:meters,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if meter is already assigned to another customer
        $existingCustomer = Customer::where('meter_id', $request->meter_id)
            ->where('id', '!=', $customer->id)
            ->first();

        if ($existingCustomer) {
            return response()->json([
                'success' => false,
                'message' => 'This meter is already assigned to another customer'
            ], 409);
        }

        // Update customer with new meter
        $customer->update([
            'meter_id' => $request->meter_id
        ]);

        // Update meter status to active
        Meter::where('id', $request->meter_id)
            ->update(['status' => 'active']);

        // Load the updated customer with relationships
        $customer->load(['neighborhood', 'category', 'meter']);

        return response()->json([
            'success' => true,
            'message' => 'Meter assigned successfully',
            'data' => $customer
        ], 200);
    }
}
