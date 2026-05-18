<?php

namespace App\Exports;

use App\Models\Bill;
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

class CustomerPaymentsExport implements FromQuery, ShouldAutoSize, WithColumnFormatting, WithHeadings, WithMapping, WithStyles
{
    use Exportable;

    public function __construct(private int $customerId) {}

    public function query()
    {
        return Bill::query()
            ->where('customer_id', $this->customerId)
            ->withSum('payments', 'amount')
            ->whereHas('payments')
            ->latest();
    }

    public function headings(): array
    {
        return [
            'Bill No',
            'Issued',
            'Total',
            'Paid',
            'Balance',
            'Status',
            'Due Date',
        ];
    }

    /**
     * @param  Bill  $bill
     */
    public function map($bill): array
    {
        return [
            $bill->bill_no,
            $bill->created_at ? Carbon::parse($bill->created_at)->format('Y-m-d') : '—',
            (float) $bill->total_amount,
            $bill->paidTotalFloat(),
            (float) $bill->current_balance,
            strtoupper((string) $bill->status),
            $bill->due_date ? Carbon::parse($bill->due_date)->format('Y-m-d') : '—',
        ];
    }

    public function columnFormats(): array
    {
        return [
            'C' => NumberFormat::FORMAT_NUMBER_00,
            'D' => NumberFormat::FORMAT_NUMBER_00,
            'E' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
