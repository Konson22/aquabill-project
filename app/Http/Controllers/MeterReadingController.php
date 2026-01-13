<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Bill;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MeterReadingController extends Controller
{
    public function index()
    {
        $meterReadings = \App\Models\MeterReading::with(['meter', 'home.customer', 'reader', 'bill'])
            ->has('bill')
            ->latest('reading_date')
            ->paginate(10);
        $meters = \App\Models\Meter::with(['home.customer'])
            ->whereNotNull('home_id')
            ->where('status', 'active')
            ->get()
            ->map(function ($meter) {
                $lastReading = $meter->readings()->latest('reading_date')->first();
                return [
                    'id' => $meter->id,
                    'meter_number' => $meter->meter_number,
                    'customer_name' => $meter->home->customer->name ?? 'Unknown',
                    'address' => $meter->home->address ?? 'Unknown',
                    'last_reading' => $lastReading ? $lastReading->current_reading : 0,
                ];
            });

        return Inertia::render('meter-reading/index', [
            'meterReadings' => $meterReadings,
            'meters' => $meters,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'meter_id' => ['required', 'exists:meters,id'],
            'reading_date' => ['required', 'date'],
            'current_reading' => ['required', 'numeric', 'min:0'],
            'previous_reading' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:pending,billed,void'],
        ]);

        // Get meter with relationships
        $meter = Meter::with('home.customer', 'home.tariff')->findOrFail($validated['meter_id']);

        // Validate that meter has a home and customer
        if (!$meter->home || !$meter->home->customer) {
            return redirect()
                ->route('meter-readings')
                ->with('error', 'Meter must be associated with a home and customer.');
        }

        // Get previous reading if not provided
        if (empty($validated['previous_reading']) || $validated['previous_reading'] === null) {
            $previousReading = MeterReading::where('meter_id', $validated['meter_id'])
                ->where('status', 'billed')
                ->latest('reading_date')
                ->first();
            
            $validated['previous_reading'] = $previousReading ? $previousReading->current_reading : 0;
        }

            // Calculate consumption units
            $validated['consumption'] = max(
                0,
                $validated['current_reading'] - $validated['previous_reading'],
            );
            $consumptionUnits = $validated['consumption'];

            // Get tariff information
            $tariff = $meter->home->tariff;
            $tariffRate = $tariff ? $tariff->price : 0;
            $fixedCharge = $tariff ? $tariff->fixed_charge : 0;
            
            // Calculate consumption cost correctly
            $consumptionAmount = $consumptionUnits * $tariffRate;
            
            // Calculate previous balance from the latest bill for the same home
            // Find the last bill that is effectively "active" (not cancelled or already forwarded)
            $lastBill = Bill::where('home_id', $meter->home_id)
                ->where('status', '!=', 'cancelled')
                ->where('status', '!=', 'forwarded')
                ->latest('id')
                ->first();
            
            $previousBalance = 0;
            if ($lastBill) {
                if ($lastBill->status == 'paid') {
                     $previousBalance = 0;
                } else {
                     $previousBalance = $lastBill->current_balance;
                }
            }

            // Set the reader (current user)
            $validated['read_by'] = Auth::id();

            // Set default status if not provided
            $validated['status'] = $validated['status'] ?? 'pending';

            // Create the reading within a transaction
            DB::beginTransaction();
            try {
                $validated['home_id'] = $meter->home_id;
                $reading = MeterReading::create($validated);

            $totalAmount = $consumptionAmount + $fixedCharge + $previousBalance;

            // Generate unique bill number
            do {
                $billCount = Bill::count();
                $billNumber = 'BILL-' . str_pad($billCount + 1, 8, '0', STR_PAD_LEFT);
            } while (Bill::where('bill_number', $billNumber)->exists());

            // Check for previous pending or overdue bills for the same home and update their status to forwarded
             if ($lastBill && $lastBill->status != 'paid') {
                 $lastBill->update(['status' => 'forwarded']);
             }
             
             // Ensure any other lingering unpaid bills are also forwarded
             Bill::where('home_id', $meter->home_id)
                ->whereIn('status', ['pending', 'overdue', 'partial_paid'])
                ->where('id', '!=', $lastBill ? $lastBill->id : 0)
                ->update(['status' => 'forwarded']);

            // Calculate billing period (monthly)
            $readingDate = \Carbon\Carbon::parse($validated['reading_date']);
            $billingPeriodStart = $readingDate->copy()->startOfMonth();
            $billingPeriodEnd = $readingDate->copy()->endOfMonth();
            $dueDate = $readingDate->copy()->addDays(14); 

            // Create the bill
            Bill::create([
                'bill_number' => $billNumber,
                'meter_reading_id' => $reading->id,
                'customer_id' => $meter->home->customer_id,
                'home_id' => $meter->home_id,
                'billing_period_start' => $billingPeriodStart,
                'billing_period_end' => $billingPeriodEnd,
                'consumption' => $consumptionUnits, // STORE UNITS HERE
                'tariff' => $tariffRate,
                'fix_charges' => $fixedCharge,
                'total_amount' => $totalAmount, // INCLUDES COST
                'current_balance' => $totalAmount,
                'previous_balance' => $previousBalance,
                'due_date' => $dueDate,
                'status' => 'pending',
            ]);

            // Update reading status to billed
            $reading->update(['status' => 'billed']);

            DB::commit();

            return redirect()
                ->back()
                ->with('success', 'Meter reading and bill created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->with('error', 'Failed to create meter reading and bill: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        if (Auth::user()->department !== 'admin') {
             return redirect()->back()->with('error', 'Unauthorized action.');
        }

        $validated = $request->validate([
            'current_reading' => ['required', 'numeric', 'min:0'],
            'reading_date' => ['required', 'date'],
        ]);

        $reading = MeterReading::with('bill', 'meter.home.tariff')->findOrFail($id);

        try {
            DB::beginTransaction();

            // 1. Update reading details
            $originalCurrentReading = $reading->current_reading;
            $reading->update([
                'current_reading' => $validated['current_reading'],
                'reading_date' => $validated['reading_date'],
            ]);

            // 2. Recalculate consumption
            $newConsumption = max(0, $reading->current_reading - $reading->previous_reading);
            $reading->update(['consumption' => $newConsumption]);

            // 3. Update Bill if exists
            if ($reading->bill && $reading->bill->status !== 'paid') {
                 $tariffRate = $reading->meter->home->tariff->price ?? 0;
                 $fixedCharge = $reading->meter->home->tariff->fixed_charge ?? 0;
                 $consumptionAmount = $newConsumption * $tariffRate;
                 $totalAmount = $consumptionAmount + $fixedCharge + $reading->bill->previous_balance;

                 $reading->bill->update([
                     'consumption' => $newConsumption, // STORE UNITS
                     'total_amount' => $totalAmount,
                     'current_balance' => $totalAmount, // Assuming no partial payments for simplicity of this update
                     'due_date' => \Carbon\Carbon::parse($validated['reading_date'])->addDays(14),
                 ]);
            }

            DB::commit();
            return redirect()->route('meter-readings')->with('success', 'Reading updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to update reading: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        if (Auth::user()->department !== 'admin') {
             return redirect()->back()->with('error', 'Unauthorized action.');
        }

        $reading = MeterReading::with('bill')->findOrFail($id);

        try {
            DB::beginTransaction();
            if ($reading->bill) {
                if ($reading->bill->status === 'paid') {
                    throw new \Exception("Cannot delete a reading with a paid bill.");
                }
                $reading->bill->delete();
            }
            $reading->delete();
            DB::commit();
             return redirect()->route('meter-readings')->with('success', 'Reading deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function report(Request $request)
    {
        // Filters
        $tariffId = $request->input('tariff_id');
        $zoneId = $request->input('zone_id');

        // Base query builder for joined tables
        $baseQuery = \App\Models\MeterReading::query()
            ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->join('homes', 'meters.home_id', '=', 'homes.id');

        // Apply filters callback
        $applyFilters = function ($query) use ($tariffId, $zoneId) {
            if ($tariffId) {
                $query->where('homes.tariff_id', $tariffId);
            }
            if ($zoneId) {
                $query->where('homes.zone_id', $zoneId);
            }
        };

        // 1. Monthly Consumption Trend (Current Year)
        $trendQuery = \App\Models\MeterReading::query()
            ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->join('homes', 'meters.home_id', '=', 'homes.id')
            ->selectRaw("DATE_FORMAT(meter_readings.reading_date, '%Y-%m') as month, SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))) as total")
            ->whereBetween('meter_readings.reading_date', [now()->startOfYear(), now()->endOfYear()]);
        
        $applyFilters($trendQuery);

        $rawTrend = $trendQuery
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');
            
        $monthlyConsumption = collect();
        $startOfYear = now()->startOfYear();
        for ($i = 0; $i < 12; $i++) {
             $date = $startOfYear->copy()->addMonths($i);
             $monthKey = $date->format('Y-m');
             $monthlyConsumption->push([
                 'name' => $date->format('M Y'),
                 'total' => isset($rawTrend[$monthKey]) ? (float) $rawTrend[$monthKey]->total : 0,
             ]);
        }

        // 2. Readings by Tariff
        $readingsByTariffQuery = \App\Models\MeterReading::query()
            ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->join('homes', 'meters.home_id', '=', 'homes.id')
            ->join('tariffs', 'homes.tariff_id', '=', 'tariffs.id')
            ->selectRaw('tariffs.name as name, COUNT(*) as value');
        
        $applyFilters($readingsByTariffQuery);

        $readingsByTariff = $readingsByTariffQuery
            ->groupBy('tariffs.name')
            ->get();

        // 3. Consumption by Breakdown
        $consumptionCalculator = \DB::raw('SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))) as value');

        // By Tariff (All tariffs with 0 if no data)
        $consumptionByTariff = \App\Models\Tariff::query()
            ->leftJoin('homes', 'tariffs.id', '=', 'homes.tariff_id')
            ->leftJoin('meters', 'homes.id', '=', 'meters.home_id')
            ->leftJoin('meter_readings', 'meters.id', '=', 'meter_readings.meter_id')
            ->select('tariffs.name as name')
            ->selectRaw('COALESCE(SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))), 0) as value');

        // Apply filters
        if ($tariffId) {
            $consumptionByTariff->where('tariffs.id', $tariffId);
        }
        if ($zoneId) {
            $consumptionByTariff->where('homes.zone_id', $zoneId);
        }

        $consumptionByTariff = $consumptionByTariff
            ->groupBy('tariffs.id', 'tariffs.name')
            ->orderByDesc('value')
            ->get();

        // By Area
        $consumptionByAreaQuery = \App\Models\MeterReading::query()
            ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->join('homes', 'meters.home_id', '=', 'homes.id')
            ->join('areas', 'homes.area_id', '=', 'areas.id')
            ->selectRaw('areas.name as name')
            ->selectRaw($consumptionCalculator);

        $applyFilters($consumptionByAreaQuery);

        $consumptionByArea = $consumptionByAreaQuery
            ->groupBy('areas.name')
            ->orderByDesc('value')
            ->get();

        // By Zone
        // By Zone (All zones with 0 if no data)
        $consumptionByZone = \App\Models\Zone::query()
            ->leftJoin('homes', function($join) use ($tariffId) {
                $join->on('zones.id', '=', 'homes.zone_id');
                if ($tariffId) {
                    $join->where('homes.tariff_id', $tariffId);
                }
            })
            ->leftJoin('meters', 'homes.id', '=', 'meters.home_id')
            ->leftJoin('meter_readings', 'meters.id', '=', 'meter_readings.meter_id')
            ->select('zones.name as name')
            ->selectRaw('COALESCE(SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))), 0) as value');

        // Apply filters (only zone_id affects the primary table directly)
        if ($zoneId) {
             $consumptionByZone->where('zones.id', $zoneId);
        }
        
        // Filter readings by date if consistent with other queries? 
        // The previous implementation for consumptionByZone didn't have date filter.
        // Assuming we keep consistency with previous 'consumptionByZoneQuery' which also didn't explicitly have the date filter in the snippet shown, 
        // but typically reports might need it. The kpiQuery doesn't have date filter either in the snippet.
        // I will match the requested 'show all zones' behavior.

        $consumptionByZone = $consumptionByZone
            ->groupBy('zones.id', 'zones.name')
            ->orderByDesc('value')
            ->get();

        // 4. KPIs
        $kpiQuery = \App\Models\MeterReading::query()
            ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->join('homes', 'meters.home_id', '=', 'homes.id');
        
        $applyFilters($kpiQuery);

        $totalReadings = $kpiQuery->count();
        $totalConsumption = $kpiQuery->sum(\DB::raw('GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))'));
        $avgConsumption = $kpiQuery->avg(\DB::raw('GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))'));

        return Inertia::render('meter-reading/report', [
            'monthlyConsumption' => $monthlyConsumption,
            'readingsByTariff' => $readingsByTariff,
            'consumptionByTariff' => $consumptionByTariff,
            'consumptionByArea' => $consumptionByArea,
            'consumptionByZone' => $consumptionByZone,
            'totalReadings' => $totalReadings,
            'totalConsumption' => $totalConsumption,
            'avgConsumption' => $avgConsumption,
            'filters' => $request->only(['tariff_id', 'zone_id']),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
            'zones' => \App\Models\Zone::select('id', 'name')->get(),
        ]);
    }

    public function export(Request $request)
    {
        $tariffId = $request->input('tariff_id');
        $zoneId = $request->input('zone_id');

        // Convert 'all' string to null for queries
        if ($tariffId === 'all') $tariffId = null;
        if ($zoneId === 'all') $zoneId = null;

        return response()->streamDownload(function () use ($tariffId, $zoneId) {
            $file = fopen('php://output', 'w');
            
            // Re-fetch data inside the closure to avoid serialization issues
            
            // 1. Monthly Data (Current Year)
            $monthlyData = \App\Models\MeterReading::query()
                ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
                ->join('homes', 'meters.home_id', '=', 'homes.id')
                ->selectRaw("DATE_FORMAT(meter_readings.reading_date, '%Y-%m') as month, SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))) as total")
                ->whereBetween('meter_readings.reading_date', [now()->startOfYear(), now()->endOfYear()])
                ->when($tariffId, fn($q) => $q->where('homes.tariff_id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('homes.zone_id', $zoneId))
                ->groupBy('month')->orderBy('month')->get();

            // 2. Tariff Data (Include all tariffs with 0 if no readings)
            $tariffData = \App\Models\Tariff::query()
                ->leftJoin('homes', 'tariffs.id', '=', 'homes.tariff_id')
                ->leftJoin('meters', 'homes.id', '=', 'meters.home_id')
                ->leftJoin('meter_readings', 'meters.id', '=', 'meter_readings.meter_id')
                ->select('tariffs.name as name')
                ->selectRaw('COALESCE(SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))), 0) as value')
                ->when($tariffId, fn($q) => $q->where('tariffs.id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('homes.zone_id', $zoneId))
                ->groupBy('tariffs.id', 'tariffs.name')->orderByDesc('value')->get();

            // 3. Zone Data (Include all zones with 0 if no readings)
            $zoneData = \App\Models\Zone::query()
                ->leftJoin('homes', function($join) use ($tariffId) {
                    $join->on('zones.id', '=', 'homes.zone_id');
                    if ($tariffId) {
                        $join->where('homes.tariff_id', $tariffId);
                    }
                })
                ->leftJoin('meters', 'homes.id', '=', 'meters.home_id')
                ->leftJoin('meter_readings', 'meters.id', '=', 'meter_readings.meter_id')
                ->select('zones.name as name')
                ->selectRaw('COALESCE(SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))), 0) as value')
                ->when($zoneId, fn($q) => $q->where('zones.id', $zoneId))
                ->groupBy('zones.id', 'zones.name')->orderByDesc('value')->get();

            // Add UTF-8 BOM for Excel compatibility with special characters like m³
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['CONSUMPTION REPORT EXPORT - ' . date('Y-m-d')]);
            fputcsv($file, []);

            // Month section
            fputcsv($file, ['1. CONSUMPTION BY MONTH (Last 12 Months)']);
            fputcsv($file, ['Month', 'Total Consumption (m³)']);
            foreach ($monthlyData as $row) fputcsv($file, [$row->month, $row->total]);
            fputcsv($file, []);

            // Tariff section
            fputcsv($file, ['2. CONSUMPTION BY TARIFF']);
            fputcsv($file, ['Tariff Name', 'Total Consumption (m³)']);
            foreach ($tariffData as $row) fputcsv($file, [$row->name, $row->value]);
            fputcsv($file, []);

            // Zone section
            fputcsv($file, ['3. CONSUMPTION BY ZONE']);
            fputcsv($file, ['Zone Name', 'Total Consumption (m³)']);
            foreach ($zoneData as $row) fputcsv($file, [$row->name, $row->value]);

            fclose($file);
        }, 'consumption_report_' . date('Y-m-d') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function show($id)
    {
        $meterReading = MeterReading::with(['meter.home.customer', 'reader', 'bill'])
            ->findOrFail($id);

        return Inertia::render('meter-reading/show', [
            'meterReading' => $meterReading,
        ]);
    }
}
