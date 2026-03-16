<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Customer;
use App\Models\Tariff;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /** Cache TTL for filter lookup data (zones, areas, tariffs). */
    private const FILTER_CACHE_TTL = 300;

    public function index(Request $request)
    {
        $customers = Customer::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhereHas('meters', function ($m) use ($search) {
                            $m->where('meter_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->zone_id, function ($query, $zoneId) {
                $query->where('zone_id', $zoneId);
            })
            ->when($request->area_id, function ($query, $areaId) {
                $query->where('area_id', $areaId);
            })
            ->when($request->tariff_id, function ($query, $tariffId) {
                $query->where('tariff_id', $tariffId);
            })
            ->with([
                'zone:id,name',
                'area:id,name',
                'meters' => fn ($q) => $q->select('id', 'customer_id', 'meter_number')
                    ->with('latestReading'),
            ])
            ->withCount('meters')
            ->latest()
            ->paginate(100)
            ->withQueryString();

        [$zones, $areas, $tariffs] = Cache::remember('customers_index_filters', self::FILTER_CACHE_TTL, function () {
            return [
                Zone::select('id', 'name')->orderBy('name')->get(),
                Area::select('id', 'name')->orderBy('name')->get(),
                Tariff::select('id', 'name')->orderBy('name')->get(),
            ];
        });

        return Inertia::render('customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'zone_id', 'area_id', 'tariff_id']),
            'zones' => $zones,
            'areas' => $areas,
            'tariffs' => $tariffs,
        ]);
    }

    public function indexForMeterDepartment(Request $request)
    {
        $customers = Customer::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhereHas('meters', function ($m) use ($search) {
                            $m->where('meter_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->zone_id, function ($query, $zoneId) {
                $query->where('zone_id', $zoneId);
            })
            ->when($request->area_id, function ($query, $areaId) {
                $query->where('area_id', $areaId);
            })
            ->when($request->tariff_id, function ($query, $tariffId) {
                $query->where('tariff_id', $tariffId);
            })
            ->with([
                'zone:id,name',
                'area:id,name',
                'meters' => fn ($q) => $q->select('id', 'customer_id', 'meter_number')
                    ->with('latestReading'),
            ])
            ->withCount('meters')
            ->latest()
            ->paginate(100)
            ->withQueryString();

        [$zones, $areas, $tariffs] = Cache::remember('customers_index_filters', self::FILTER_CACHE_TTL, function () {
            return [
                Zone::select('id', 'name')->orderBy('name')->get(),
                Area::select('id', 'name')->orderBy('name')->get(),
                Tariff::select('id', 'name')->orderBy('name')->get(),
            ];
        });

        return Inertia::render('dashboard-meter-department/customers/index', [
            'customers' => $customers,
            'filters' => $request->only(['search', 'zone_id', 'area_id', 'tariff_id']),
            'zones' => $zones,
            'areas' => $areas,
            'tariffs' => $tariffs,
        ]);
    }

    public function export(Request $request)
    {
        $customers = \App\Models\Customer::query()
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhereHas('meters', function ($m) use ($search) {
                            $m->where('meter_number', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->zone_id && $request->zone_id !== 'all', function ($query, $zoneId) {
                $query->where('zone_id', $zoneId);
            })
            ->when($request->area_id && $request->area_id !== 'all', function ($query, $areaId) {
                $query->where('area_id', $areaId);
            })
            ->when($request->tariff_id && $request->tariff_id !== 'all', function ($query, $tariffId) {
                $query->where('tariff_id', $tariffId);
            })
            ->with(['zone:id,name', 'area:id,name', 'meters:id,customer_id,meter_number'])
            ->latest()
            ->get();

        $summary = [
            'zones' => \App\Models\Zone::count(),
            'areas' => \App\Models\Area::count(),
            'tariffs' => \App\Models\Tariff::count(),
            'customers' => \App\Models\Customer::count(),
            'supply_status' => [
                'active' => \App\Models\Customer::where('supply_status', 'active')->count(),
                'suspended' => \App\Models\Customer::where('supply_status', 'suspended')->count(),
                'disconnect' => \App\Models\Customer::where('supply_status', 'disconnect')->count(),
            ],
        ];

        $html = $this->buildStyledExportHtml($customers, $summary);

        return response($html, 200, [
            'Content-Type' => 'application/vnd.ms-excel',
            'Content-Disposition' => 'attachment; filename="customers_export_' . now()->format('Y-m-d') . '.xls"',
        ]);
    }

    protected function buildStyledExportHtml($customers, $summary): string
    {
        $summaryRows = '';
        foreach (
            [
                ['Zones', $summary['zones']],
                ['Areas', $summary['areas']],
                ['Tariffs', $summary['tariffs']],
                ['Customers', $summary['customers']],
                ['Active', $summary['supply_status']['active']],
                ['Suspended', $summary['supply_status']['suspended']],
                ['Disconnected', $summary['supply_status']['disconnect']],
            ] as $row
        ) {
            $summaryRows .= '<tr><td style="border:1px solid #000;padding:6px;">' . htmlspecialchars((string) $row[0]) . '</td><td style="border:1px solid #000;padding:6px;">' . htmlspecialchars((string) $row[1]) . '</td></tr>';
        }

        $customerRows = '';
        foreach ($customers as $customer) {
            $meterNos = $customer->meters->pluck('meter_number')->filter()->implode(', ');
            $customerRows .= '<tr>';
            $customerRows .= '<td style="border:1px solid #ddd;padding:6px;">' . htmlspecialchars($customer->name ?? '') . '</td>';
            $customerRows .= '<td style="border:1px solid #ddd;padding:6px;">' . htmlspecialchars($customer->phone ?? '') . '</td>';
            $customerRows .= '<td style="border:1px solid #ddd;padding:6px;">' . htmlspecialchars($customer->plot_number ?? '') . '</td>';
            $customerRows .= '<td style="border:1px solid #ddd;padding:6px;">' . htmlspecialchars($meterNos) . '</td>';
            $customerRows .= '<td style="border:1px solid #ddd;padding:6px;">' . htmlspecialchars($customer->zone?->name ?? '') . '</td>';
            $customerRows .= '<td style="border:1px solid #ddd;padding:6px;">' . htmlspecialchars($customer->area?->name ?? '') . '</td>';
            $customerRows .= '</tr>';
        }

        return '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>
<body>
<table cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr><td colspan="2" style="border:1px solid #000;padding:8px;font-weight:bold;background:#e8e8e8;">Summary</td></tr>
' . $summaryRows . '
<tr><td colspan="2" style="height:12px;"></td></tr>
<tr>
<td style="border:1px solid #333;padding:8px;font-weight:bold;background:#4472c4;color:#fff;">Name</td>
<td style="border:1px solid #333;padding:8px;font-weight:bold;background:#4472c4;color:#fff;">Phone</td>
<td style="border:1px solid #333;padding:8px;font-weight:bold;background:#4472c4;color:#fff;">Plot No</td>
<td style="border:1px solid #333;padding:8px;font-weight:bold;background:#4472c4;color:#fff;">Meter No</td>
<td style="border:1px solid #333;padding:8px;font-weight:bold;background:#4472c4;color:#fff;">Zone</td>
<td style="border:1px solid #333;padding:8px;font-weight:bold;background:#4472c4;color:#fff;">Area</td>
</tr>
' . $customerRows . '
</table>
</body>
</html>';
    }

    public function create()
    {
        return Inertia::render('customers/create', [
            'zones' => \App\Models\Zone::select('id', 'name')->get(),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
            'areas' => \App\Models\Area::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'plot_number' => 'nullable|string|max:50',
            'zone_id' => 'nullable|exists:zones,id',
            'area_id' => 'nullable|exists:areas,id',
            'tariff_id' => 'nullable|exists:tariffs,id',
            'meter_id' => 'nullable|exists:meters,id',
            'initial_reading' => 'nullable|numeric|min:0',
            'installation_fee' => 'nullable|numeric|min:0',
        ]);

        $customer = \App\Models\Customer::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'address' => $validated['address'] ?? null,
            'plot_number' => $validated['plot_number'] ?? null,
            'zone_id' => $validated['zone_id'] ?? null,
            'area_id' => $validated['area_id'] ?? null,
            'tariff_id' => $validated['tariff_id'] ?? null,
        ]);

        if (!empty($validated['meter_id'])) {
            $meter = \App\Models\Meter::find($validated['meter_id']);
            if ($meter) {
                $meter->update([
                    'customer_id' => $customer->id,
                    'status' => 'active',
                ]);

                $customer->update([
                    'meter_install_date' => now(),
                ]);

                if (isset($validated['initial_reading'])) {
                    \App\Models\MeterReading::create([
                        'meter_id' => $meter->id,
                        'customer_id' => $customer->id,
                        'current_reading' => $validated['initial_reading'],
                        'previous_reading' => 0,
                        'reading_date' => now(),
                        'is_initial' => true,
                        'read_by' => auth()->id(),
                    ]);
                }
            }
        }

        if (!empty($validated['installation_fee']) && $validated['installation_fee'] > 0) {
            $amount = (float) $validated['installation_fee'];
            \App\Models\Invoice::create([
                'invoice_number' => 'INV-' . strtoupper(uniqid()),
                'customer_id' => $customer->id,
                'description' => 'One-time installation fee',
                'amount' => $amount,
                'due_date' => now()->addDays(30),
                'status' => 'pending',
            ]);
        }

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    public function show($id)
    {
        $customer = \App\Models\Customer::with([
            'meter.readings',
            'meter.latestReading',
            'meters.readings',
            'meters.latestReading',
            'meterHistory' => fn ($q) => $q->with(['meter:id,meter_number', 'replacedBy:id,name'])->orderBy('unassigned_at', 'desc'),
            'readings' => fn ($q) => $q->with([
                'meter:id,meter_number',
                'bill:id,bill_number,meter_reading_id',
                'reader:id,name',
            ])->orderBy('reading_date', 'desc'),
            'bills',
            'bills.payments',
            'bills.meterReading.meter',
            'invoices',
            'invoices.payments',
            'zone',
            'area',
            'tariff',
        ])->findOrFail($id);

        return Inertia::render('customers/show', [
            'customer' => $customer,
            'zones' => \App\Models\Zone::with('areas')->get(),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
        ]);
    }

    /** @deprecated Use show() - one customer = one record; kept for route compatibility */
    public function home($id)
    {
        return redirect()->route('customers.show', $id);
    }

    public function edit($id)
    {
        $customer = \App\Models\Customer::with('meter')->findOrFail($id);
        return Inertia::render('customers/edit', [
            'customer' => $customer,
            'zones' => \App\Models\Zone::select('id', 'name')->get(),
            'tariffs' => \App\Models\Tariff::select('id', 'name')->get(),
            'areas' => \App\Models\Area::select('id', 'name', 'zone_id')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'plot_number' => 'nullable|string|max:50',
            'zone_id' => 'nullable|exists:zones,id',
            'area_id' => 'nullable|exists:areas,id',
            'tariff_id' => 'nullable|exists:tariffs,id',
            'supply_status' => 'nullable|in:active,suspended,disconnect',
        ]);

        $customer = \App\Models\Customer::findOrFail($id);
        $customer->update($validated);

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy($id)
    {
        $customer = \App\Models\Customer::findOrFail($id);
        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully.');
    }

    public function search(Request $request)
    {
        $search = $request->query('query');

        if (!$search) {
            return response()->json([]);
        }

        $customers = \App\Models\Customer::query()
            ->with(['meter:id,meter_number,customer_id'])
            ->where(function ($q) use ($search) {
                $q->where('address', 'like', "%{$search}%")
                    ->orWhere('plot_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhereHas('meter', function ($q) use ($search) {
                        $q->where('meter_number', 'like', "%{$search}%");
                    });
            })
            ->limit(10)
            ->get(['id', 'name', 'address', 'plot_number']);

        $results = $customers->map(function ($customer) {
            return [
                'id' => $customer->id,
                'label' => ($customer->address ?? $customer->name) . ' - ' . $customer->name,
                'value' => $customer->id,
                'customer_name' => $customer->name,
                'address' => $customer->address,
                'plot_number' => $customer->plot_number,
                'meter_number' => $customer->meter?->meter_number ?? null,
                'meter' => $customer->meter ? ['id' => $customer->meter->id, 'meter_number' => $customer->meter->meter_number] : null,
            ];
        });

        return response()->json($results);
    }
}
