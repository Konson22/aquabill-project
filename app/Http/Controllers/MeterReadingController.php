<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateMeterReadingRequest;
use App\Models\MeterReading;
use App\Services\BillService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MeterReadingController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $from = $request->input('from'); // YYYY-MM-DD
        $to = $request->input('to'); // YYYY-MM-DD

        $readings = MeterReading::with(['meter.customer', 'recorder'])
            ->where('is_initial', false)
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('meter', function ($mq) use ($search) {
                    $mq->where('meter_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($cq) use ($search) {
                            $cq->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($from, fn ($q) => $q->whereDate('reading_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('reading_date', '<=', $to))
            ->orderBy('id', 'desc')
            ->paginate(100)
            ->withQueryString();

        return Inertia::render('readings/index', [
            'readings' => $readings,
            'filters' => [
                'search' => $search,
                'from' => $from,
                'to' => $to,
            ],
        ]);
    }

    public function store(Request $request, BillService $billService)
    {
        $validated = $request->validate([
            'meter_id' => 'required|exists:meters,id',
            'previous_reading' => 'nullable|numeric|min:0',
            'current_reading' => 'required|numeric|min:0',
            'reading_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        if (array_key_exists('previous_reading', $validated) && $validated['previous_reading'] !== null) {
            if ((float) $validated['current_reading'] < (float) $validated['previous_reading']) {
                throw ValidationException::withMessages([
                    'current_reading' => __('The current reading must be greater than or equal to the previous reading.'),
                ]);
            }
        }

        $validated['recorded_by'] = auth()->id();

        $reading = MeterReading::create($validated);

        // Automatically generate bill for this meter
        try {
            $billService->generateForMeter($reading->meter_id);
        } catch (\Exception $e) {
            Log::error("Automated billing failed for meter #{$reading->meter_id}: ".$e->getMessage());
        }

        return back()->with('success', 'Reading recorded and bill generated successfully.');
    }

    public function show(MeterReading $reading): Response
    {
        $reading->load(['meter.customer.zone', 'meter.customer.tariff', 'recorder', 'bill']);

        $reading->image_url = $reading->image ? Storage::disk('public')->url($reading->image) : null;

        return Inertia::render('readings/show', [
            'reading' => $reading,
        ]);
    }

    public function edit(MeterReading $reading): Response
    {
        $reading->load(['meter.customer.zone', 'bill']);

        $reading->image_url = $reading->image ? Storage::disk('public')->url($reading->image) : null;

        return Inertia::render('readings/edit', [
            'reading' => $reading,
        ]);
    }

    public function update(UpdateMeterReadingRequest $request, MeterReading $reading, BillService $billService): RedirectResponse
    {
        $reading->update($request->validated());

        $billService->syncBillForReading($reading->fresh());

        return redirect()
            ->route('readings.show', $reading)
            ->with('success', 'Reading updated successfully.');
    }

    public function export(Request $request)
    {
        $search = trim((string) $request->string('search'));
        $from = $request->input('from');
        $to = $request->input('to');

        $query = MeterReading::with(['meter.customer', 'recorder'])
            ->where('is_initial', false)
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('meter', function ($mq) use ($search) {
                    $mq->where('meter_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($cq) use ($search) {
                            $cq->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($from, fn ($q) => $q->whereDate('reading_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('reading_date', '<=', $to))
            ->orderBy('id', 'desc');

        $filename = 'meter_readings_'.date('Y-m-d_His').'.csv';
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=$filename",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        // Calculate summaries
        $totalConsumption = (clone $query)->sum('meter_readings.consumption');
        $customersCount = (clone $query)->join('meters', 'meter_readings.meter_id', '=', 'meters.id')
            ->distinct('meters.customer_id')
            ->count('meters.customer_id');
        $totalAmount = (clone $query)->join('bills', 'meter_readings.id', '=', 'bills.reading_id')
            ->sum('bills.total_amount');

        $callback = function () use ($query, $totalConsumption, $customersCount, $totalAmount) {
            $file = fopen('php://output', 'w');

            // Write Summary Header
            fputcsv($file, ['Export Summary']);
            fputcsv($file, ['Unique Customers', $customersCount]);
            fputcsv($file, ['Total Consumption (m3)', number_format((float) $totalConsumption, 2, '.', '')]);
            fputcsv($file, ['Total Bill Amount (SSP)', number_format((float) $totalAmount, 2, '.', '')]);
            fputcsv($file, []); // Empty line separator

            $columns = [
                'ID', 'Meter Number', 'Customer Name', 'Previous Reading', 'Current Reading', 'Consumption', 'Reading Date', 'Recorded By', 'Bill Amount', 'Bill Status',
            ];
            fputcsv($file, $columns);

            $query->chunk(500, function ($readings) use ($file) {
                $readings->load('bill');
                foreach ($readings as $reading) {
                    fputcsv($file, [
                        $reading->id,
                        $reading->meter->meter_number ?? 'N/A',
                        $reading->meter->customer->name ?? 'N/A',
                        $reading->previous_reading,
                        $reading->current_reading,
                        $reading->consumption,
                        $reading->reading_date ? Carbon::parse($reading->reading_date)->format('Y-m-d H:i') : 'N/A',
                        $reading->recorder->name ?? 'System',
                        $reading->bill ? $reading->bill->total_amount : '0.00',
                        $reading->bill ? ucfirst($reading->bill->status) : 'N/A',
                    ]);
                }
            });

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
