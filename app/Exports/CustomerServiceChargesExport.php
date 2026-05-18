<?php

namespace App\Exports;

use App\Models\ServiceCharge;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CustomerServiceChargesExport implements FromQuery, ShouldAutoSize, WithColumnFormatting, WithHeadings, WithMapping, WithStyles
{
    use Exportable;

    public function __construct(private int $customerId) {}

    public function query()
    {
        return ServiceCharge::query()
            ->where('customer_id', $this->customerId)
            ->with(['serviceChargeType', 'issuer'])
            ->latest('issued_date')
            ->latest('id');
    }

    public function headings(): array
    {
        return [
            'Charge ID',
            'Date Applied',
            'Type',
            'Status',
            'Amount',
            'Other Charges',
            'Total Due',
            'Due Date',
            'Notes',
        ];
    }

    /**
     * @param  ServiceCharge  $charge
     */
    public function map($charge): array
    {
        return [
            'CHG-'.str_pad((string) $charge->id, 5, '0', STR_PAD_LEFT),
            $charge->issued_date
                ? Carbon::parse($charge->issued_date)->format('Y-m-d')
                : ($charge->created_at ? Carbon::parse($charge->created_at)->format('Y-m-d') : '—'),
            $charge->serviceChargeType?->name ?? '—',
            strtoupper((string) ($charge->status ?? 'unpaid')),
            (float) $charge->amount,
            (float) ($charge->other_charges ?? 0),
            $charge->totalDueFloat(),
            $charge->due_date ? Carbon::parse($charge->due_date)->format('Y-m-d') : '—',
            $charge->notes,
        ];
    }

    public function columnFormats(): array
    {
        return [
            'E' => NumberFormat::FORMAT_NUMBER_00,
            'F' => NumberFormat::FORMAT_NUMBER_00,
            'G' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
