<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Http\Response;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('department')
            ->orderBy('name')
            ->paginate(20);

        $departments = Department::withCount('users')
            ->orderBy('name')
            ->get();

        return Inertia::render('users/index', [
            'users' => $users,
            'departments' => $departments,
        ]);
    }

    public function create()
    {
        $departments = Department::orderBy('name')->get();

        return Inertia::render('users/create', [
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'status' => 'required|string|in:active,inactive',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => $request->status,
            'department_id' => $request->department_id,
        ]);

        return redirect()->route('users.index')
            ->with('success', 'Staff member created successfully.');
    }

    public function show(User $user)
    {
        $user->load([
            'department',
            'meterReadings' => function ($query) {
                $query->with(['meter.customer'])->latest()->limit(10);
            },
            'generatedBills' => function ($query) {
                $query->with(['customer'])->latest()->limit(10);
            },
            'receivedPayments' => function ($query) {
                $query->with(['customer'])->latest()->limit(10);
            }
        ]);

        // Get user statistics
        $stats = [
            'total_readings' => $user->meterReadings()->count(),
            'total_bills_generated' => $user->generatedBills()->count(),
            'total_payments_received' => $user->receivedPayments()->count(),
            'total_inventory_transactions' => $user->inventoryTransactions()->count(),
            'total_maintenance_requests' => $user->maintenanceRequests()->count(),
            'recent_activity_count' => $user->meterReadings()->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return Inertia::render('users/show', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function edit(User $user)
    {
        $departments = Department::orderBy('name')->get();

        return Inertia::render('users/edit', [
            'user' => $user,
            'departments' => $departments,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|string|in:admin,manager,staff,operator',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'department_id' => $request->department_id,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('users.index')
            ->with('success', 'Staff member updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Staff member deleted successfully.');
    }

    /**
     * Export user's meter readings to CSV
     */
    public function exportReadings(User $user)
    {
        try {
            $readings = $user->meterReadings()
                ->with(['meter.customer', 'bills'])
                ->orderBy('created_at', 'desc')
                ->get();

        $filename = "user_{$user->id}_readings_" . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $callback = function() use ($readings) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Reading ID',
                'Customer Name',
                'Customer Account Number',
                'Meter Number',
                'Meter Type',
                'Reading Value',
                'Previous Value',
                'Consumption',
                'Date',
                'Source',
                'Note',
                'Illegal Connection',
                'Bill Generated',
                'Bill ID',
                'Bill Amount',
                'Created At'
            ]);

            // CSV Data
            foreach ($readings as $reading) {
                $customer = $reading->meter->customer;
                $bill = $reading->bills->first(); // Get the first bill if exists
                
                fputcsv($file, [
                    $reading->id,
                    $customer ? 
                        $customer->first_name . ' ' . $customer->last_name : 
                        'N/A',
                    $customer ? $customer->account_number : 'N/A',
                    $reading->meter->meter_number ?? 'N/A',
                    $reading->meter->type ?? 'N/A',
                    $reading->value,
                    $reading->previous,
                    $reading->value - $reading->previous, // consumption
                    $reading->date,
                    $reading->source ?? 'N/A',
                    $reading->note ?? 'N/A',
                    $reading->illigal_connection ? 'Yes' : 'No',
                    $bill ? 'Yes' : 'No',
                    $bill ? $bill->id : 'N/A',
                    $bill ? $bill->total_amount : 'N/A',
                    $reading->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            \Log::error("Export readings error: " . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Export user's generated bills to CSV
     */
    public function exportBills(User $user)
    {
        try {
            $bills = $user->generatedBills()
                ->with(['customer', 'meter', 'reading'])
                ->orderBy('created_at', 'desc')
                ->get();

        $filename = "user_{$user->id}_bills_" . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $callback = function() use ($bills) {
            $file = fopen('php://output', 'w');
            
            // CSV Headers
            fputcsv($file, [
                'Bill ID',
                'Customer Name',
                'Customer Account Number',
                'Customer Phone',
                'Customer Email',
                'Meter Number',
                'Meter Type',
                'Reading ID',
                'Reading Value',
                'Billing Period Start',
                'Billing Period End',
                'Previous Balance',
                'Consumption',
                'Unit Price',
                'Fixed Charge',
                'Other Charge',
                'Total Amount',
                'Current Balance',
                'Status',
                'Generated By',
                'Created At'
            ]);

            // CSV Data
            foreach ($bills as $bill) {
                $customer = $bill->customer;
                $meter = $bill->meter;
                $reading = $bill->reading;
                
                fputcsv($file, [
                    $bill->id,
                    $customer ? 
                        $customer->first_name . ' ' . $customer->last_name : 
                        'N/A',
                    $customer ? $customer->account_number : 'N/A',
                    $customer ? $customer->phone : 'N/A',
                    $customer ? $customer->email : 'N/A',
                    $meter ? $meter->meter_number : 'N/A',
                    $meter ? $meter->type : 'N/A',
                    $bill->reading_id,
                    $reading ? $reading->value : 'N/A',
                    $bill->billing_period_start,
                    $bill->billing_period_end,
                    $bill->prev_balance,
                    $bill->consumption,
                    $bill->unit_price,
                    $bill->fixed_charge,
                    $bill->other_charge,
                    $bill->total_amount,
                    $bill->current_balance,
                    $bill->status,
                    $user->name,
                    $bill->created_at->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            \Log::error("Export bills error: " . $e->getMessage());
            return response()->json(['error' => 'Export failed: ' . $e->getMessage()], 500);
        }
    }
}
