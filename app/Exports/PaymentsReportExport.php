<?php

namespace App\Exports;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PaymentsReportExport implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    /**
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<string, int|string|null>  $filters
     * @param  array{payments_count: int, total_amount: float}  $summary
     */
    public function __construct(
        private array $rows,
        private array $filters,
        private array $summary,
    ) {}

    public function title(): string
    {
        return 'Payments';
    }

    private function periodLabel(): string
    {
        $from = $this->filters['from'] ?? null;
        $to = $this->filters['to'] ?? null;

        if ($from && $to) {
            return Carbon::parse((string) $from)->format('M d, Y').' - '.Carbon::parse((string) $to)->format('M d, Y');
        }
        if ($from) {
            return 'From '.Carbon::parse((string) $from)->format('M d, Y');
        }
        if ($to) {
            return 'Up to '.Carbon::parse((string) $to)->format('M d, Y');
        }

        return 'All';
    }

    public function headings(): array
    {
        return [
            ['Payments report'],
            ['Period:', $this->periodLabel()],
            ['Payments count:', $this->summary['payments_count']],
            ['Total collected (SSP):', $this->summary['total_amount']],
            ['Generated:', now()->format('M d, Y H:i:s')],
            [],
            [
                'Date',
                'Type',
                'Reference',
                'Customer',
                'Account number',
                'Zone',
                'Tariff',
                'Payment method',
                'Station',
                'Recorded by',
                'Amount (SSP)',
            ],
        ];
    }

    public function array(): array
    {
        return array_map(
            fn (array $row): array => [
                $row['payment_date'] ?? '',
                $row['type_label'] ?? '',
                $row['reference'] ?? '',
                $row['customer_name'] ?? '',
                $row['account_number'] ?? '',
                $row['zone_name'] ?? '',
                $row['tariff_name'] ?? '',
                $row['payment_method'] ?? '',
                $row['station_name'] ?? '',
                $row['recorder_name'] ?? '',
                (float) ($row['amount'] ?? 0),
            ],
            $this->rows
        );
    }

    /**
     * @return array<int|string, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        $sheet->mergeCells('A1:K1');

        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555']]],
            3 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555']]],
            4 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555']]],
            5 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555'], 'size' => 9]],
            7 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF047857'],
                ],
            ],
        ];
    }
}
