<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Meter;
use App\Models\MeterReading;
use App\Models\Bill;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class MeterReadingController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->input('month'); // YYYY-MM format

        $query = \App\Models\MeterReading::with(['meter', 'customer', 'reader', 'bill' => fn ($q) => $q->withSum('payments', 'amount')])
            ->where(function ($q) {
                $q->has('bill')->orWhere('is_initial', true);
            });

        if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
            $query->whereYear('reading_date', substr($month, 0, 4))
                ->whereMonth('reading_date', (int) substr($month, 5, 2));
        }

        $meterReadings = $query->latest('reading_date')
            ->paginate(10)
            ->withQueryString();

        // Latest reading per meter in a single query (avoids N+1)
        $latestReadings = DB::table('meter_readings as mr')
            ->select('mr.meter_id', 'mr.current_reading')
            ->leftJoin('meter_readings as mr2', function ($join) {
                $join->on('mr.meter_id', '=', 'mr2.meter_id')
                    ->whereRaw('(mr.reading_date < mr2.reading_date OR (mr.reading_date = mr2.reading_date AND mr.id < mr2.id))');
            })
            ->whereNull('mr2.id')
            ->pluck('current_reading', 'meter_id');

        $meters = Meter::with('customer:id,name,address')
            ->whereNotNull('customer_id')
            ->get(['id', 'meter_number', 'customer_id'])
            ->map(function ($meter) use ($latestReadings) {
                return [
                    'id' => $meter->id,
                    'meter_number' => $meter->meter_number,
                    'customer_name' => $meter->customer?->name ?? 'Unknown',
                    'address' => $meter->customer?->address ?? 'Unknown',
                    'last_reading' => $latestReadings[$meter->id] ?? 0,
                ];
            });

        return Inertia::render('meter-reading/index', [
            'meterReadings' => $meterReadings,
            'meters' => $meters,
            'filters' => $request->only(['month']),
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Web reading submission', [
            'payload' => $request->all(),
            'user_id' => Auth::id()
        ]);

        $validated = $request->validate([
            'meter_id' => ['required', 'exists:meters,id'],
            'reading_date' => ['required', 'date'],
            'current_reading' => ['required', 'numeric', 'min:0'],
            'previous_reading' => ['nullable', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
            'notes' => ['nullable', 'string'],
        ]);

        // Get meter with relationships
        $meter = Meter::with('customer.tariff')->findOrFail($validated['meter_id']);
        $customer = $meter->customer;

        // Validate that meter has a customer
        if (!$customer) {
            return redirect()
                ->back()
                ->with('error', 'Meter must be associated with a customer.');
        }

        // Fetch the latest reading from database to validate against
        $dbLastReading = MeterReading::where('meter_id', $meter->id)
            ->where('customer_id', $customer->id)
            ->orderBy('reading_date', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        if ($dbLastReading && $validated['current_reading'] <= $dbLastReading->current_reading) {
            return redirect()
                ->back()
                ->with('error', "Current reading ({$validated['current_reading']}) must be greater than the last recorded reading ({$dbLastReading->current_reading}).");
        }

        // Get previous reading if not provided
        if (!isset($validated['previous_reading']) || $validated['previous_reading'] === null) {
            $validated['previous_reading'] = $dbLastReading ? $dbLastReading->current_reading : 0;
        }

        // Calculate consumption units
        $consumption = max(0, $validated['current_reading'] - $validated['previous_reading']);

        // Handle image upload
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('readings', 'public');
        }

        DB::beginTransaction();
        try {
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

            // Previous balance from last bill and update its status if still pending
            $lastBill = Bill::where('customer_id', $customer->id)
                ->orderByDesc('id')
                ->first();

            $previousBalance = 0;
            if ($lastBill) {
                if ($lastBill->status === 'pending') {
                    $lastBill->update(['status' => 'forwarded']);
                }
                $previousBalance = (float) $lastBill->balance;
            }

            // Generate unique bill number
            $billCount = Bill::count();
            $billNumber = 'BILL-' . str_pad($billCount + 1, 8, '0', STR_PAD_LEFT);

            // Calculate billing period and due date
            $readingDate = Carbon::parse($validated['reading_date']);

            // Create the bill (amount = water_consumption_volume * tariff + fix_charges is computed on the model)
            Bill::create([
                'bill_number' => $billNumber,
                'meter_reading_id' => $reading->id,
                'customer_id' => $customer->id,
                'billing_period_start' => $readingDate->copy()->startOfMonth(),
                'billing_period_end' => $readingDate->copy()->endOfMonth(),
                'tariff' => $tariffRate,
                'fix_charges' => $fixedCharge,
                'water_consumption_volume' => $consumption,
                'previous_balance' => $previousBalance,
                'due_date' => $readingDate->copy()->addDays(14),
            ]);

            DB::commit();

            return redirect()
                ->back()
                ->with('success', 'Meter reading and bill created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Web reading submission failed', [
                'error' => $e->getMessage(),
                'payload' => $request->all()
            ]);

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

        $reading = MeterReading::with('bill', 'meter.customer.tariff')->findOrFail($id);

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
            if (\Schema::hasColumn('meter_readings', 'consumption')) {
                $reading->update(['consumption' => $newConsumption]);
            }

            // 3. Update linked bill when reading changes (recalculate volume and period)
            if ($reading->bill && $reading->bill->balance > 0) {
                $tariffRate = $reading->meter->customer?->tariff?->price ?? 0;
                $fixedCharge = $reading->meter->customer?->tariff?->fixed_charge ?? 0;
                $readingDate = Carbon::parse($validated['reading_date']);

                $reading->bill->update([
                    'tariff' => $tariffRate,
                    'fix_charges' => $fixedCharge,
                    'water_consumption_volume' => $newConsumption,
                    'billing_period_start' => $readingDate->copy()->startOfMonth(),
                    'billing_period_end' => $readingDate->copy()->endOfMonth(),
                    'due_date' => $readingDate->copy()->addDays(14),
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
                if ($reading->bill->status === 'fully paid') {
                    throw new \Exception("Cannot delete a reading with a fully paid bill.");
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
        $month = $request->input('month'); // YYYY-MM

        // Apply filters callback
        $applyFilters = function ($query) use ($tariffId, $zoneId, $month) {
            if ($tariffId) {
                $query->where('customers.tariff_id', $tariffId);
            }
            if ($zoneId) {
                $query->where('customers.zone_id', $zoneId);
            }
            if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
                $query->whereYear('meter_readings.reading_date', substr($month, 0, 4))
                    ->whereMonth('meter_readings.reading_date', (int) substr($month, 5, 2));
            }
        };

        $dateRange = ($month && preg_match('/^\d{4}-\d{2}$/', $month))
            ? [Carbon::parse($month . '-01')->startOfMonth(), Carbon::parse($month . '-01')->endOfMonth()]
            : [now()->startOfYear(), now()->endOfYear()];

        // 1. Monthly Consumption Trend
        $trendQuery = \App\Models\MeterReading::query()
            ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->join('customers', 'meters.customer_id', '=', 'customers.id')
            ->selectRaw("DATE_FORMAT(meter_readings.reading_date, '%Y-%m') as month, SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))) as total")
            ->whereBetween('meter_readings.reading_date', $dateRange);

        $applyFilters($trendQuery);

        $rawTrend = $trendQuery
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');
            
        $monthlyConsumption = collect();
        if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
            $date = Carbon::parse($month . '-01');
            $monthKey = $date->format('Y-m');
            $monthlyConsumption->push([
                'name' => $date->format('M Y'),
                'total' => isset($rawTrend[$monthKey]) ? (float) $rawTrend[$monthKey]->total : 0,
            ]);
        } else {
            $startOfYear = now()->startOfYear();
            for ($i = 0; $i < 12; $i++) {
                $date = $startOfYear->copy()->addMonths($i);
                $monthKey = $date->format('Y-m');
                $monthlyConsumption->push([
                    'name' => $date->format('M Y'),
                    'total' => isset($rawTrend[$monthKey]) ? (float) $rawTrend[$monthKey]->total : 0,
                ]);
            }
        }

        // 2. Readings by Tariff
        $readingsByTariffQuery = \App\Models\MeterReading::query()
            ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->join('customers', 'meters.customer_id', '=', 'customers.id')
            ->join('tariffs', 'customers.tariff_id', '=', 'tariffs.id')
            ->selectRaw('tariffs.name as name, COUNT(*) as value');
        
        $applyFilters($readingsByTariffQuery);

        $readingsByTariff = $readingsByTariffQuery
            ->groupBy('tariffs.name')
            ->get();

        // 3. Consumption by Breakdown
        $consumptionCalculator = \DB::raw('SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))) as value');

        // By Tariff (All tariffs with 0 if no data)
        $consumptionByTariff = \App\Models\Tariff::query()
            ->leftJoin('customers', 'tariffs.id', '=', 'customers.tariff_id')
            ->leftJoin('meters', 'customers.id', '=', 'meters.customer_id')
            ->leftJoin('meter_readings', 'meters.id', '=', 'meter_readings.meter_id')
            ->select('tariffs.name as name')
            ->selectRaw('COALESCE(SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))), 0) as value');

        // Apply filters
        if ($tariffId) {
            $consumptionByTariff->where('tariffs.id', $tariffId);
        }
        if ($zoneId) {
            $consumptionByTariff->where('customers.zone_id', $zoneId);
        }
        if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
            $consumptionByTariff->whereYear('meter_readings.reading_date', substr($month, 0, 4))
                ->whereMonth('meter_readings.reading_date', (int) substr($month, 5, 2));
        }

        $consumptionByTariff = $consumptionByTariff
            ->groupBy('tariffs.id', 'tariffs.name')
            ->orderByDesc('value')
            ->get();

        // By Area
        $consumptionByAreaQuery = \App\Models\MeterReading::query()
            ->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->join('customers', 'meters.customer_id', '=', 'customers.id')
            ->join('areas', 'customers.area_id', '=', 'areas.id')
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
            ->leftJoin('customers', function($join) use ($tariffId) {
                $join->on('zones.id', '=', 'customers.zone_id');
                if ($tariffId) {
                    $join->where('customers.tariff_id', $tariffId);
                }
            })
            ->leftJoin('meters', 'customers.id', '=', 'meters.customer_id')
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
            ->join('customers', 'meters.customer_id', '=', 'customers.id');
        
        $applyFilters($kpiQuery);

        $totalReadings = $kpiQuery->count();
        $totalConsumption = $kpiQuery->sum(\DB::raw('GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))'));
        $avgConsumption = $kpiQuery->avg(\DB::raw('GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))'));

        $overdueQuery = MeterReading::with(['meter', 'customer'])
            ->whereDate('reading_date', '<', now()->subMonth())
            ->when($tariffId, function ($query) use ($tariffId) {
                $query->whereHas('customer', function ($q) use ($tariffId) {
                    $q->where('tariff_id', $tariffId);
                });
            })
            ->when($zoneId, function ($query) use ($zoneId) {
                $query->whereHas('customer', function ($q) use ($zoneId) {
                    $q->where('zone_id', $zoneId);
                });
            })
            ->orderBy('reading_date');

        $overdueReadings = $overdueQuery
            ->limit(10)
            ->get()
            ->map(function ($reading) {
                return [
                    'id' => $reading->id,
                    'reading_date' => $reading->reading_date,
                    'meter_number' => $reading->meter->meter_number ?? '—',
                    'customer_name' => $reading->customer?->name ?? 'Unknown',
                ];
            });

        return Inertia::render('meter-reading/report', [
            'monthlyConsumption' => $monthlyConsumption,
            'readingsByTariff' => $readingsByTariff,
            'consumptionByTariff' => $consumptionByTariff,
            'consumptionByArea' => $consumptionByArea,
            'consumptionByZone' => $consumptionByZone,
            'totalReadings' => $totalReadings,
            'totalConsumption' => $totalConsumption,
            'avgConsumption' => $avgConsumption,
            'overdueReadings' => $overdueReadings,
            'filters' => $request->only(['tariff_id', 'zone_id', 'month']),
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
                ->join('customers', 'meters.customer_id', '=', 'customers.id')
                ->selectRaw("DATE_FORMAT(meter_readings.reading_date, '%Y-%m') as month, SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))) as total")
                ->whereBetween('meter_readings.reading_date', [now()->startOfYear(), now()->endOfYear()])
                ->when($tariffId, fn($q) => $q->where('customers.tariff_id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('customers.zone_id', $zoneId))
                ->groupBy('month')->orderBy('month')->get();

            // 2. Tariff Data (Include all tariffs with 0 if no readings)
            $tariffData = \App\Models\Tariff::query()
                ->leftJoin('customers', 'tariffs.id', '=', 'customers.tariff_id')
                ->leftJoin('meters', 'customers.id', '=', 'meters.customer_id')
                ->leftJoin('meter_readings', 'meters.id', '=', 'meter_readings.meter_id')
                ->select('tariffs.name as name')
                ->selectRaw('COALESCE(SUM(GREATEST(0, meter_readings.current_reading - COALESCE(meter_readings.previous_reading, 0))), 0) as value')
                ->when($tariffId, fn($q) => $q->where('tariffs.id', $tariffId))
                ->when($zoneId, fn($q) => $q->where('customers.zone_id', $zoneId))
                ->groupBy('tariffs.id', 'tariffs.name')->orderByDesc('value')->get();

            // 3. Zone Data (Include all zones with 0 if no readings)
            $zoneData = \App\Models\Zone::query()
                ->leftJoin('customers', function($join) use ($tariffId) {
                    $join->on('zones.id', '=', 'customers.zone_id');
                    if ($tariffId) {
                        $join->where('customers.tariff_id', $tariffId);
                    }
                })
                ->leftJoin('meters', 'customers.id', '=', 'meters.customer_id')
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
        $meterReading = MeterReading::with(['meter.home', 'reader', 'bill'])
            ->findOrFail($id);

        if ($meterReading->image) {
            $meterReading->image = asset('/storage/app/public/'.$meterReading->image); 
        }

        return Inertia::render('meter-reading/show', [
            'meterReading' => $meterReading,
        ]);
    }
}
