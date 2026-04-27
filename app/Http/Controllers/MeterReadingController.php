<?php

namespace App\Http\Controllers;

use App\Models\MeterReading;
use App\Services\BillService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            'current_reading' => 'required|numeric|min:0',
            'reading_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

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
        $reading->load(['meter.customer.zone', 'meter.customer.tariff', 'recorder', 'bill.payments']);

        $reading->image_url = $reading->image ? \Illuminate\Support\Facades\Storage::disk('public')->url($reading->image) : null;

        return Inertia::render('readings/show', [
            'reading' => $reading,
        ]);
    }
}
