<?php

namespace App\Exports;

use App\Models\MeterReading;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CustomerReadingsExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    use Exportable;

    public function __construct(private int $customerId) {}

    public function query()
    {
        return MeterReading::query()
            ->where('customer_id', $this->customerId)
            ->with(['meter', 'recorder'])
            ->latest('reading_date')
            ->latest('id');
    }

    public function headings(): array
    {
        return [
            'Reading Date',
            'Meter No',
            'Previous (m³)',
            'Current (m³)',
            'Consumption (m³)',
            'Type',
            'Recorded By',
            'Notes',
        ];
    }

    /**
     * @param  MeterReading  $reading
     */
    public function map($reading): array
    {
        $isInitial = (float) $reading->previous_reading === 0.0;

        return [
            $reading->reading_date ? Carbon::parse($reading->reading_date)->format('Y-m-d') : '—',
            $reading->meter_number ?? $reading->meter?->meter_number,
            $reading->previous_reading,
            $reading->current_reading,
            $reading->consumption,
            $isInitial ? 'Initial' : 'Regular',
            $reading->recorder?->name ?? 'System',
            $reading->notes,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
