<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Neighborhood;
use App\Models\Customer;
use App\Models\Meter;
use App\Models\Category;
use App\Models\MeterLog;
use App\Models\Invoice;
use Carbon\Carbon;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $neighborhoods = Neighborhood::all();
        $categories = Category::all();
        $customers = Customer::with(['neighborhood', 'category', 'meter'])->get();
        $meters = Meter::with('customer')->get();
        return Inertia::render('customers/index', compact('neighborhoods', 'categories', 'customers', 'meters'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $neighborhoods = Neighborhood::all();
        $meters = Meter::whereDoesntHave('customer')->get();
        $categories = \App\Models\Category::all();
        
        return Inertia::render('customers/create', compact('neighborhoods', 'meters', 'categories'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|string|email|max:255',
            'category_id' => 'required|exists:categories,id',
            'date' => 'nullable|date',
            'contract' => 'nullable|string|max:255',
            'credit' => 'nullable|numeric|min:0',
            'account_number' => 'nullable|string|max:255|unique:customers',
            'is_active' => 'nullable|boolean',
            'meter_id' => 'nullable|exists:meters,id',
            'plot_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'neighborhood_id' => 'nullable|exists:neighborhoods,id',
            'new_neighborhood_name' => 'nullable|string|max:255',
            
            // Invoice fields
            'invoice_reason' => 'nullable|string|max:255',
            'invoice_issue_date' => 'nullable|date',
            'invoice_due_date' => 'nullable|date|after_or_equal:invoice_issue_date',
            'invoice_amount_due' => 'nullable|numeric|min:0',
        ]);

        // Custom validation: at least one neighborhood option must be provided
        if (!$request->filled('neighborhood_id') && !$request->filled('new_neighborhood_name')) {
            return back()->withErrors([
                'neighborhood_id' => 'Please either select an existing neighborhood or add a new one.',
                'new_neighborhood_name' => 'Please either select an existing neighborhood or add a new one.'
            ])->withInput();
        }

        // Generate account number if not provided
        $accountNumber = $request->input('account_number') ?: 'ACC' . str_pad(Customer::count() + 1, 5, '0', STR_PAD_LEFT);

        $neighborhoodId = $request->input('neighborhood_id');

        // Create new neighborhood if provided
        if ($request->filled('new_neighborhood_name')) {
            $neighborhood = Neighborhood::create([
                'name' => $request->input('new_neighborhood_name'),
            ]);
            $neighborhoodId = $neighborhood->id;
        }

        $customer = Customer::create([
            'first_name' => $request->input('first_name'),
            'last_name' => $request->input('last_name'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'category_id' => $request->input('category_id'),
            'neighborhood_id' => $neighborhoodId,
            'plot_number' => $request->input('plot_number'),
            'address' => $request->input('address'),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'meter_id' => $request->input('meter_id'),
            'date' => $request->input('date') ?? Carbon::now(),
            'contract' => $request->input('contract'),
            'credit' => $request->input('credit') ?? 0,
            'account_number' => $accountNumber,
            'is_active' => $request->input('is_active', true),
        ]);

        // Set meter status to active when assigned to customer during creation
        if ($request->input('meter_id')) {
            Meter::where('id', $request->input('meter_id'))->update(['status' => 'active']);
        }

        // Create invoice if invoice fields are provided
        if ($request->filled('invoice_reason') && $request->filled('invoice_amount_due')) {
            Invoice::create([
                'customer_id' => $customer->id,
                'reason' => $request->input('invoice_reason'),
                'issue_date' => $request->input('invoice_issue_date') ?? Carbon::now(),
                'due_date' => $request->input('invoice_due_date') ?? Carbon::now()->addDays(30),
                'amount_due' => $request->input('invoice_amount_due'),
                'status' => 'pending',
            ]);
        }

        return redirect()->route('customers.show', $customer->id)
            ->with('success', 'Customer created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $customer = Customer::with([
            'neighborhood', 
            'category', 
            'meter.readings', 
            'readings.meter',
            'bills', 
            'invoices',
            'payments',
            'meterLogs.oldMeter',
            'meterLogs.newMeter',
            'meterLogs.performedBy',
        ])->findOrFail($id);
        
        $customers = Customer::all();
        
        // Get available meters that are not assigned to any customer
        $availableMeters = Meter::whereDoesntHave('customer')
            ->get()
            ->map(function ($meter) {
                return [
                    'id' => $meter->id,
                    'serial' => $meter->serial,
                    'status' => $meter->status,
                    'model' => $meter->model,
                    'manufactory' => $meter->manufactory,
                    'type' => $meter->model,
                    'customer_id' => null,
                    'customer_name' => null,
                ];
            });

        // Get meters for reading form (including customer's current meter)
        $metersForReadings = collect();
        if ($customer->meter) {
            $metersForReadings->push([
                'id' => $customer->meter->id,
                'serial' => $customer->meter->serial ?: $customer->meter->id,
                'type' => $customer->meter->model,
                'previous_reading' => $customer->meter->readings->max('value') ?: 0,
            ]);
        }
        
        return Inertia::render('customers/show', compact('customer', 'customers', 'availableMeters', 'metersForReadings'));
    }



    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $customer = Customer::with(['neighborhood', 'category', 'meter'])->findOrFail($id);
        $categories = \App\Models\Category::all();
        $neighborhoods = Neighborhood::all();
        
        // Get available meters (unassigned + current customer's meter)
        $meters = Meter::whereDoesntHave('customer')
            ->orWhere('id', $customer->meter_id)
            ->get();

        return Inertia::render('customers/edit', compact('customer', 'categories', 'neighborhoods', 'meters'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $customer = Customer::findOrFail($id);

        // Check if this is a status toggle update (only is_active field)
        if ($request->has('is_active') && count($request->only(['is_active', '_method'])) === 2) {
            \Log::info('Status toggle request received', [
                'customer_id' => $id,
                'is_active' => $request->input('is_active'),
                'request_data' => $request->all()
            ]);
            
            $customer->update([
                'is_active' => $request->input('is_active')
            ]);

            \Log::info('Customer status updated', [
                'customer_id' => $id,
                'new_status' => $customer->is_active
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Customer status updated successfully.',
                'is_active' => $customer->is_active
            ]);
        }

        // Check if this is a meter assignment update
        if ($request->has('meter_id') || $request->has('reason') || $request->has('notes')) {
            // Handle meter assignment
            $request->validate([
                'meter_id' => 'nullable|exists:meters,id',
                'reason' => 'nullable|string|max:255',
                'notes' => 'nullable|string|max:1000',
            ]);

            $oldMeterId = $customer->meter_id;
            $newMeterId = $request->input('meter_id');
            $reason = $request->input('reason', 'Meter change');
            $notes = $request->input('notes', '');

            // Determine action type based on the change
            $actionType = 'meter_replacement';
            if (!$oldMeterId && $newMeterId) {
                $actionType = 'initial_assignment';
            } elseif ($oldMeterId && !$newMeterId) {
                $actionType = 'meter_removal';
            } elseif ($oldMeterId && $newMeterId && $oldMeterId != $newMeterId) {
                $actionType = 'meter_replacement';
            }

            // Update meter assignment
            $customer->update([
                'meter_id' => $newMeterId,
            ]);

            // Update meter status based on assignment
            if ($oldMeterId) {
                // Set old meter to inactive when removed from customer
                Meter::where('id', $oldMeterId)->update(['status' => 'inactive']);
            }
            
            if ($newMeterId) {
                // Set new meter to active when assigned to customer
                Meter::where('id', $newMeterId)->update(['status' => 'active']);
            }

            // Log the meter change in MeterLog
            \App\Models\MeterLog::create([
                'customer_id' => $customer->id,
                'old_meter_id' => $oldMeterId,
                'new_meter_id' => $newMeterId,
                'action_type' => $actionType,
                'reason' => $reason,
                'effective_date' => now(),
                'performed_by' => auth()->id(),
                'notes' => $notes,
                'old_meter_data' => $oldMeterId ? \App\Models\Meter::find($oldMeterId)?->toArray() : null,
                'new_meter_data' => $newMeterId ? \App\Models\Meter::find($newMeterId)?->toArray() : null,
            ]);

            return redirect()->route('customers.show', $customer->id)
                ->with('success', 'Meter assignment updated successfully.');
        }

        // Regular customer update
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|string|email|max:255',
            'category_id' => 'required|exists:categories,id',
            'neighborhood_id' => 'nullable|exists:neighborhoods,id',
            'new_neighborhood_name' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'contract' => 'nullable|string|max:255',
            'credit' => 'nullable|numeric|min:0',
            'meter_id' => 'nullable|exists:meters,id',
            'account_number' => 'nullable|string|max:255|unique:customers,account_number,' . $id,
            'is_active' => 'nullable|boolean',
            'plot_number' => 'required|string|max:20',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        // Custom validation: at least one neighborhood option must be provided
        if (!$request->filled('neighborhood_id') && !$request->filled('new_neighborhood_name')) {
            return back()->withErrors([
                'neighborhood_id' => 'Please either select an existing neighborhood or add a new one.',
                'new_neighborhood_name' => 'Please either select an existing neighborhood or add a new one.'
            ])->withInput();
        }

        $neighborhoodId = $request->input('neighborhood_id');

        // Create new neighborhood if provided
        if ($request->filled('new_neighborhood_name')) {
            $neighborhood = Neighborhood::create([
                'name' => $request->input('new_neighborhood_name'),
            ]);
            $neighborhoodId = $neighborhood->id;
        }

        $oldMeterId = $customer->meter_id;
        $newMeterId = $request->input('meter_id');

        $customer->update([
            'first_name' => $request->input('first_name'),
            'last_name' => $request->input('last_name'),
            'phone' => $request->input('phone'),
            'email' => $request->input('email'),
            'category_id' => $request->input('category_id'),
            'neighborhood_id' => $neighborhoodId,
            'plot_number' => $request->input('plot_number'),
            'address' => $request->input('address'),
            'latitude' => $request->input('latitude'),
            'longitude' => $request->input('longitude'),
            'date' => $request->input('date'),
            'contract' => $request->input('contract'),
            'credit' => $request->input('credit') ?? 0,
            'meter_id' => $request->input('meter_id'),
            'account_number' => $request->input('account_number'),
            'is_active' => $request->input('is_active', true),
        ]);

        // Update meter status based on assignment changes
        if ($oldMeterId != $newMeterId) {
            if ($oldMeterId) {
                // Set old meter to inactive when removed from customer
                Meter::where('id', $oldMeterId)->update(['status' => 'inactive']);
            }
            
            if ($newMeterId) {
                // Set new meter to active when assigned to customer
                Meter::where('id', $newMeterId)->update(['status' => 'active']);
            }
        }

        return redirect()->route('customers.show', $customer->id)
            ->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $customer = Customer::findOrFail($id);
        
        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Customer deleted successfully.');
    }

    /**
     * Export a customer's bills as CSV (Excel-compatible)
     */
    public function exportBills(Customer $customer)
    {
        $customer->load(['bills.meter', 'bills.reading', 'bills.payments', 'category']);

        $filename = 'customer_' . $customer->id . '_bills_' . now()->format('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $columns = [
            'Bill ID', 'Date', 'Customer', 'Account', 'Customer Type', 'Meter',
            'Prev Reading', 'Current Reading', 'Consumption', 'Fixed Charges', 'Tariff',
            'Billing Officer', 'Outstanding', 'Prev Balance', 'Volumetric Charge',
            'Illegal Connection', 'Illegal Connection*Tariff', 'Total', 'Amount Paid', 'Payment Date', 'Status',
        ];

        $callback = function () use ($customer, $columns) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($handle, $columns);
            $customer->bills()->with(['meter', 'reading', 'customer.category', 'generatedBy'])->orderBy('billing_period_end', 'desc')->chunk(500, function ($rows) use ($handle, $customer) {
                foreach ($rows as $b) {
                    $customerName = $customer->full_name;
                    $account = $customer->account_number ?? '';
                    $customerType = $customer->category->type_id ?? '';
                    $meterSerial = $b->meter->serial ?? '';
                    $prevReading = optional($b->reading)->previous ?? '';
                    $currentReading = optional($b->reading)->value ?? '';
                    $consumption = (float) ($b->consumption ?? 0);
                    $fixedCharge = (float) ($b->fixed_charge ?? 0);
                    $tariff = (float) ($b->unit_price ?? 0);
                    $billingOfficer = optional($b->generatedBy)->name ?? '';
                    $outstanding = (float) ($b->current_balance ?? 0);
                    $prevBalance = (float) ($b->prev_balance ?? 0);
                    $volumetricCharge = $consumption * $tariff;
                    $illegalConnection = (float) (optional($b->reading)->illigal_connection ?? 0);
                    $illegalConnectionTariff = $illegalConnection * $tariff;
                    $total = (float) ($b->total_amount ?? 0);
                    $amountPaid = (float) ($b->payments?->sum('amount_paid') ?? 0);
                    $latestPayment = optional($b->payments?->sortByDesc('payment_date')->first())->payment_date;
                    fputcsv($handle, [
                        $b->id,
                        $b->billing_period_end,
                        $customerName,
                        $account,
                        $customerType,
                        $meterSerial,
                        $prevReading,
                        $currentReading,
                        $consumption,
                        $fixedCharge,
                        $tariff,
                        $billingOfficer,
                        $outstanding,
                        $prevBalance,
                        $volumetricCharge,
                        $illegalConnection,
                        $illegalConnectionTariff,
                        $total,
                        $amountPaid,
                        $latestPayment,
                        $b->status,
                    ]);
                }
            });
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export a customer's meter readings as CSV
     */
public function exportReadings(Customer $customer)
    {
        $customer->load(['meter', 'readings.meter', 'category', 'bills.reading']);

        $filename = 'customer_' . $customer->id . '_readings_' . now()->format('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $columns = [
            'Reading ID', 'Date', 'Start Date', 'End Date', 'Meter', 'Prev Reading', 'Current Reading', 'Consumption', 
            'Tariff', 'Fixed Charges', 'Total Amount', 'Billing Officer'
        ];

        $callback = function () use ($customer, $columns) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            
            // Add customer information header
            fputcsv($handle, ['CUSTOMER INFORMATION']);
            fputcsv($handle, ['Customer Name', $customer->first_name . ' ' . $customer->last_name]);
            fputcsv($handle, ['Address', $customer->address ?? 'N/A']);
            fputcsv($handle, ['Plot Number', $customer->plot_number ?? 'N/A']);
            fputcsv($handle, ['Account Number', $customer->account_number ?? 'N/A']);
            fputcsv($handle, ['Export Date', now()->format('Y-m-d H:i:s')]);
            fputcsv($handle, []); // Empty row
            
            // Add column headers
            fputcsv($handle, $columns);
            
            // Get customer's tariff and fixed charges from category
            $tariff = $customer->category?->tariff ?? 0;
            $fixedCharges = $customer->category?->fixed_charge ?? 0;
            
            // Get all readings ordered by date to calculate proper start/end dates
            $allReadings = $customer->readings()->with(['meter', 'recordedBy', 'bills'])->orderBy('date', 'asc')->get();
            
            foreach ($allReadings as $index => $r) {
                $consumption = (float) ($r->consumption ?? ($r->value - $r->previous));
                
                // Calculate volumetric charge (consumption * tariff)
                $volumetricCharge = $consumption * $tariff;
                
                // Calculate total amount (volumetric + fixed charges)
                $totalAmount = $volumetricCharge + $fixedCharges;
                
                // Calculate start and end dates for billing period
                $startDate = $r->date; // Current reading date
                $endDate = $r->date;   // Current reading date
                
                // If this is not the first reading, start date should be the previous reading date
                if ($index > 0) {
                    $previousReading = $allReadings[$index - 1];
                    $startDate = $previousReading->date;
                }
                
                fputcsv($handle, [
                    $r->id,
                    $r->date,
                    $startDate,
                    $endDate,
                    $r->meter?->serial,
                    $r->previous,
                    $r->value,
                    $consumption,
                    $tariff,
                    $fixedCharges,
                    $totalAmount,
                    optional($r->recordedBy)->name ?? '',
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export customer data as Excel (CSV format)
     */
    public function exportCustomer(Customer $customer)
    {
        $customer->load(['category', 'neighborhood', 'meter', 'invoices', 'bills', 'payments']);

        $filename = 'customer_' . $customer->id . '_' . $customer->first_name . '_' . $customer->last_name . '_' . now()->format('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($customer) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            
            // Customer Basic Information
            fputcsv($handle, ['CUSTOMER INFORMATION']);
            fputcsv($handle, ['Field', 'Value']);
            fputcsv($handle, ['Customer ID', $customer->id]);
            fputcsv($handle, ['First Name', $customer->first_name]);
            fputcsv($handle, ['Last Name', $customer->last_name]);
            fputcsv($handle, ['Phone', $customer->phone]);
            fputcsv($handle, ['Email', $customer->email]);
            fputcsv($handle, ['Account Number', $customer->account_number]);
            fputcsv($handle, ['Contract Number', $customer->contract]);
            fputcsv($handle, ['Contract Date', $customer->date]);
            fputcsv($handle, ['Credit Balance', $customer->credit]);
            fputcsv($handle, ['Status', $customer->is_active ? 'Active' : 'Inactive']);
            fputcsv($handle, ['Category', $customer->category?->name]);
            fputcsv($handle, ['Neighborhood', $customer->neighborhood?->name]);
            fputcsv($handle, ['Plot Number', $customer->plot_number]);
            fputcsv($handle, ['Address', $customer->address]);
            fputcsv($handle, ['Latitude', $customer->latitude]);
            fputcsv($handle, ['Longitude', $customer->longitude]);
            fputcsv($handle, ['Created At', $customer->created_at]);
            fputcsv($handle, ['Updated At', $customer->updated_at]);
            fputcsv($handle, []); // Empty row

            // Meter Information
            fputcsv($handle, ['METER INFORMATION']);
            fputcsv($handle, ['Field', 'Value']);
            if ($customer->meter) {
                fputcsv($handle, ['Meter ID', $customer->meter->id]);
                fputcsv($handle, ['Serial Number', $customer->meter->serial]);
                fputcsv($handle, ['Model', $customer->meter->model]);
                fputcsv($handle, ['Size', $customer->meter->size]);
                fputcsv($handle, ['Manufacturer', $customer->meter->manufactory]);
                fputcsv($handle, ['Status', $customer->meter->status]);
                fputcsv($handle, ['Installation Date', $customer->meter->created_at]);
            } else {
                fputcsv($handle, ['Meter', 'No meter assigned']);
            }
            fputcsv($handle, []); // Empty row

            // Invoices Information
            fputcsv($handle, ['SERVICE INVOICES']);
            fputcsv($handle, ['Invoice ID', 'Reason', 'Issue Date', 'Due Date', 'Amount Due', 'Status', 'Created At']);
            if ($customer->invoices && $customer->invoices->count() > 0) {
                foreach ($customer->invoices as $invoice) {
                    fputcsv($handle, [
                        $invoice->id,
                        $invoice->reason,
                        $invoice->issue_date,
                        $invoice->due_date,
                        $invoice->amount_due,
                        $invoice->status,
                        $invoice->created_at,
                    ]);
                }
            } else {
                fputcsv($handle, ['No invoices found', '', '', '', '', '', '']);
            }
            fputcsv($handle, []); // Empty row

            // Bills Summary
            fputcsv($handle, ['BILLS SUMMARY']);
            fputcsv($handle, ['Total Bills', $customer->bills ? $customer->bills->count() : 0]);
            fputcsv($handle, ['Total Amount Billed', $customer->bills ? $customer->bills->sum('total_amount') : 0]);
            fputcsv($handle, ['Outstanding Balance', $customer->bills ? $customer->bills->sum('current_balance') : 0]);
            fputcsv($handle, ['Paid Bills', $customer->bills ? $customer->bills->where('status', 'paid')->count() : 0]);
            fputcsv($handle, ['Unpaid Bills', $customer->bills ? $customer->bills->where('status', 'unpaid')->count() : 0]);
            fputcsv($handle, ['Overdue Bills', $customer->bills ? $customer->bills->where('status', 'overdue')->count() : 0]);
            fputcsv($handle, []); // Empty row

            // Payments Summary
            fputcsv($handle, ['PAYMENTS SUMMARY']);
            fputcsv($handle, ['Total Payments', $customer->payments ? $customer->payments->count() : 0]);
            fputcsv($handle, ['Total Amount Paid', $customer->payments ? $customer->payments->sum('amount_paid') : 0]);
            fputcsv($handle, ['Last Payment Date', $customer->payments ? $customer->payments->max('payment_date') : 'No payments']);
            fputcsv($handle, []); // Empty row

            // Recent Bills (Last 10)
            fputcsv($handle, ['RECENT BILLS (Last 10)']);
            fputcsv($handle, ['Bill ID', 'Date', 'Consumption', 'Total Amount', 'Current Balance', 'Status']);
            if ($customer->bills && $customer->bills->count() > 0) {
                $recentBills = $customer->bills->sortByDesc('created_at')->take(10);
                foreach ($recentBills as $bill) {
                    fputcsv($handle, [
                        $bill->id,
                        $bill->created_at,
                        $bill->consumption,
                        $bill->total_amount,
                        $bill->current_balance,
                        $bill->status,
                    ]);
                }
            } else {
                fputcsv($handle, ['No bills found', '', '', '', '', '']);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export all customers as Excel (CSV format)
     */
    public function exportAll()
    {
        $customers = Customer::with(['category', 'neighborhood', 'meter', 'invoices', 'bills', 'payments'])
            ->orderBy('created_at', 'desc')
            ->get();

        $filename = 'all_customers_' . now()->format('Ymd_His') . '.csv';
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($customers) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));
            
            // Summary Statistics
            fputcsv($handle, ['CUSTOMERS EXPORT SUMMARY']);
            fputcsv($handle, ['Total Customers', $customers->count()]);
            fputcsv($handle, ['Active Customers', $customers->where('is_active', true)->count()]);
            fputcsv($handle, ['Inactive Customers', $customers->where('is_active', false)->count()]);
            fputcsv($handle, ['Customers with Meters', $customers->whereNotNull('meter_id')->count()]);
            fputcsv($handle, ['Export Date', now()->format('Y-m-d H:i:s')]);
            fputcsv($handle, []); // Empty row

            // Customer Data Headers
            fputcsv($handle, [
                'Customer ID',
                'First Name',
                'Last Name',
                'Phone',
                'Email',
                'Account Number',
                'Contract Number',
                'Contract Date',
                'Credit Balance',
                'Status',
                'Category',
                'Neighborhood',
                'Plot Number',
                'Address',
                'Latitude',
                'Longitude',
                'Meter ID',
                'Meter Serial',
                'Meter Model',
                'Meter Status',
                'Total Bills',
                'Total Amount Billed',
                'Outstanding Balance',
                'Total Invoices',
                'Total Invoice Amount',
                'Total Payments',
                'Total Amount Paid',
                'Last Payment Date',
                'Created At',
                'Updated At'
            ]);

            // Customer Data Rows
            foreach ($customers as $customer) {
                fputcsv($handle, [
                    $customer->id,
                    $customer->first_name,
                    $customer->last_name,
                    $customer->phone,
                    $customer->email,
                    $customer->account_number,
                    $customer->contract,
                    $customer->date,
                    $customer->credit,
                    $customer->is_active ? 'Active' : 'Inactive',
                    $customer->category?->name,
                    $customer->neighborhood?->name,
                    $customer->plot_number,
                    $customer->address,
                    $customer->latitude,
                    $customer->longitude,
                    $customer->meter?->id,
                    $customer->meter?->serial,
                    $customer->meter?->model,
                    $customer->meter?->status,
                    $customer->bills ? $customer->bills->count() : 0,
                    $customer->bills ? $customer->bills->sum('total_amount') : 0,
                    $customer->bills ? $customer->bills->sum('current_balance') : 0,
                    $customer->invoices ? $customer->invoices->count() : 0,
                    $customer->invoices ? $customer->invoices->sum('amount_due') : 0,
                    $customer->payments ? $customer->payments->count() : 0,
                    $customer->payments ? $customer->payments->sum('amount_paid') : 0,
                    $customer->payments ? $customer->payments->max('payment_date') : 'No payments',
                    $customer->created_at,
                    $customer->updated_at,
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Assign a meter to a customer
     */
    public function assignMeter(Request $request, Customer $customer)
    {
        $request->validate([
            'meter_id' => 'required|exists:meters,id',
        ]);

        // Check if meter is already assigned to another customer
        $existingCustomer = Customer::where('meter_id', $request->meter_id)
            ->where('id', '!=', $customer->id)
            ->first();

        if ($existingCustomer) {
            return back()->withErrors([
                'meter_id' => 'This meter is already assigned to another customer'
            ]);
        }

        $oldMeter = $customer->meter;
        $newMeter = Meter::find($request->meter_id);
        $actionType = $oldMeter ? 'replacement' : 'assignment';

        // If customer already has a meter, set it to inactive
        if ($oldMeter) {
            $oldMeter->update(['status' => 'inactive']);
        }

        // Update customer with new meter
        $customer->update([
            'meter_id' => $request->meter_id
        ]);

        // Update new meter status to active
        $newMeter->update(['status' => 'active']);

        // Create meter log entry
        MeterLog::create([
            'customer_id' => $customer->id,
            'old_meter_id' => $oldMeter?->id,
            'new_meter_id' => $newMeter->id,
            'action_type' => $actionType,
            'reason' => $request->input('reason', 'Meter ' . $actionType),
            'effective_date' => now(),
            'installation_date' => now(),
            'performed_by' => auth()->id(),
            'old_meter_data' => $oldMeter ? [
                'serial' => $oldMeter->serial,
                'model' => $oldMeter->model,
                'manufactory' => $oldMeter->manufactory,
                'status' => 'inactive'
            ] : null,
            'new_meter_data' => [
                'serial' => $newMeter->serial,
                'model' => $newMeter->model,
                'manufactory' => $newMeter->manufactory,
                'status' => 'active'
            ],
            'notes' => $request->input('notes', 'Meter ' . $actionType . ' performed')
        ]);

        $successMessage = $oldMeter 
            ? 'Meter replaced successfully. Old meter set to inactive.'
            : 'Meter assigned successfully';

        return back()->with('success', $successMessage);
    }

    /**
     * Update meter status
     */
    public function updateMeterStatus(Request $request, Customer $customer)
    {
        $request->validate([
            'meter_id' => 'required|exists:meters,id',
            'status' => 'required|in:active,inactive,maintenance,damaged',
        ]);

        // Verify the meter belongs to this customer
        if ($customer->meter_id != $request->meter_id) {
            return back()->withErrors([
                'meter_id' => 'This meter does not belong to this customer'
            ]);
        }

        // Update meter status
        Meter::where('id', $request->meter_id)
            ->update(['status' => $request->status]);

        return back()->with('success', 'Meter status updated successfully');
    }
}
