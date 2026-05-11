<?php

namespace App\Exports;

use App\Models\Bill;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class BillsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithColumnFormatting, WithStyles
{
    use Exportable;

    protected $search;
    protected $status;

    public function __construct($search = '', $status = 'all')
    {
        $this->search = $search;
        $this->status = $status;
    }

    public function query()
    {
        $search = $this->search;
        $status = $this->status;

        return Bill::query()
            ->with(['customer.zone', 'meter'])
            ->withSum('payments', 'amount')
            ->when($status === 'pending', function ($query) {
                $query->where('status', 'pending')
                      ->whereDate('due_date', '>=', Carbon::today());
            })
            ->when($status === 'partial', function ($query) {
                $query->where('status', 'partial');
            })
            ->when($status === 'forwarded', function ($query) {
                $query->where('status', 'forwarded');
            })
            ->when($status === 'paid', function ($query) {
                $query->where('status', 'paid');
            })
            ->when($status === 'overdue', function ($query) {
                $query->whereIn('status', ['pending', 'partial'])
                      ->whereDate('due_date', '<', Carbon::today());
            })
            ->when($search !== '', function ($query) use ($search): void {
                $pattern = '%'.addcslashes($search, '%_\\').'%';
                $query->where(function ($q) use ($pattern): void {
                    $q->where('bills.bill_no', 'like', $pattern)
                        ->orWhere('bills.meter_number', 'like', $pattern)
                        ->orWhereHas('customer', function ($cq) use ($pattern): void {
                            $cq->where('name', 'like', $pattern)
                                ->orWhere('phone', 'like', $pattern);
                        })
                        ->orWhereHas('customer.zone', function ($zq) use ($pattern): void {
                            $zq->where('name', 'like', $pattern);
                        })
                        ->orWhereHas('meter', function ($mq) use ($pattern): void {
                            $mq->where('meter_number', 'like', $pattern);
                        });
                });
            })
            ->latest();
    }

    public function headings(): array
    {
        return [
            'Bill No',
            'Customer Name',
            'Phone',
            'Zone',
            'Meter No',
            'Usage (m³)',
            'Arrears',
            'Current Charge',
            'Total Due',
            'Paid Amount',
            'Balance',
            'Status',
            'Due Date',
        ];
    }

    public function map($bill): array
    {
        return [
            $bill->bill_no,
            $bill->customer?->name,
            $bill->customer?->phone,
            $bill->customer?->zone?->name,
            $bill->meter_number,
            $bill->consumption,
            $bill->previous_balance,
            $bill->current_charge,
            $bill->total_amount,
            $bill->paidTotalFloat(),
            (float) $bill->current_balance,
            strtoupper($bill->status),
            Carbon::parse($bill->due_date)->format('Y-m-d'),
        ];
    }

    public function columnFormats(): array
    {
        return [
            'G' => NumberFormat::FORMAT_NUMBER_00,
            'H' => NumberFormat::FORMAT_NUMBER_00,
            'I' => NumberFormat::FORMAT_NUMBER_00,
            'J' => NumberFormat::FORMAT_NUMBER_00,
            'K' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
