<?php

namespace App\Exports;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RevenueSummaryExport implements WithMultipleSheets
{
    public function __construct(
        protected array $summary,
        protected array $filters,
        protected array $bills = [],
        protected array $monthlyBreakdown = [],
        protected ?int $monthlyBreakdownYear = null,
    ) {}

    public function sheets(): array
    {
        return [
            new RevenueSummarySheet($this->summary, $this->filters),
            new RevenueMonthlySheet($this->monthlyBreakdown, $this->monthlyBreakdownYear),
            new RevenueBillsSheet($this->bills, $this->filters),
        ];
    }
}

class RevenueSummarySheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    protected $summary;

    protected $filters;

    public function __construct($summary, $filters)
    {
        $this->summary = $summary;
        $this->filters = $filters;
    }

    public function title(): string
    {
        return 'Summary';
    }

    protected function getPeriodLabel(): string
    {
        $from = $this->filters['from'] ?? null;
        $to = $this->filters['to'] ?? null;

        if ($from && $to) {
            return Carbon::parse($from)->format('M d, Y').' - '.Carbon::parse($to)->format('M d, Y');
        } elseif ($from) {
            return 'From '.Carbon::parse($from)->format('M d, Y');
        } elseif ($to) {
            return 'Up to '.Carbon::parse($to)->format('M d, Y');
        }

        return 'All Time';
    }

    public function headings(): array
    {
        return [
            ['Revenue Summary Report'],
            ['Period:', $this->getPeriodLabel()],
            ['Generated:', now()->format('M d, Y H:i:s')],
            [],
            ['Metric', 'Amount (SSP)'],
        ];
    }

    public function array(): array
    {
        return [
            ['Water Revenue', $this->summary['total_revenue']],
            ['Fixed Charges', $this->summary['fixed_charge_revenue']],
            ['Service Charges (total)', $this->summary['service_charges_revenue'] ?? 0],
            ['Service Charges (paid)', $this->summary['service_charges_paid'] ?? 0],
            ['Service Charges (unpaid)', $this->summary['service_charges_unpaid'] ?? 0],
            ['Total Billed Revenue', $this->summary['total_billed_revenue']],
            ['Total Collected', $this->summary['total_paid']],
            ['Collection Rate (%)', $this->summary['collection_rate_percent']],
            ['Total Outstanding', $this->summary['total_outstanding']],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->mergeCells('A1:B1');

        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555']]],
            3 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555'], 'size' => 9]],
            5 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF047857'], // Emerald 700
                ],
            ],
        ];
    }
}

class RevenueMonthlySheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    /**
     * @param  list<array{
     *     month: string,
     *     label: string,
     *     amount_expected: float,
     *     payments_amount: float,
     *     bills_count?: int
     * }>  $monthlyBreakdown
     */
    public function __construct(
        private array $monthlyBreakdown,
        private ?int $year = null,
    ) {}

    public function title(): string
    {
        return 'Payments by month';
    }

    public function headings(): array
    {
        $year = $this->year ?? now()->year;

        return [
            ['Payments and bills by month'],
            ['Year:', (string) $year],
            ['Generated:', now()->format('M d, Y H:i:s')],
            [],
            [
                'Month',
                'Amount of bills generated (SSP)',
                'Payments collected (SSP)',
                'Collection rate (%)',
                'vs last month (payments)',
            ],
        ];
    }

    public function array(): array
    {
        $rows = [];
        $totalExpected = 0.0;
        $totalPayments = 0.0;

        foreach ($this->monthlyBreakdown as $index => $row) {
            $expected = (float) ($row['amount_expected'] ?? 0);
            $payments = (float) ($row['payments_amount'] ?? 0);
            $previous = $index > 0 ? $this->monthlyBreakdown[$index - 1] : null;
            $previousPayments = $previous ? (float) ($previous['payments_amount'] ?? 0) : null;

            $totalExpected += $expected;
            $totalPayments += $payments;

            $rows[] = [
                $row['label'] ?? '',
                $expected,
                $payments,
                $this->collectionRatePercent($payments, $expected),
                $this->formatPaymentsChangePercent(
                    $this->monthOverMonthPercentChange($payments, $previousPayments),
                    $previous !== null,
                ),
            ];
        }

        if ($rows !== []) {
            $rows[] = [
                'Total',
                round($totalExpected, 2),
                round($totalPayments, 2),
                $this->collectionRatePercent($totalPayments, $totalExpected),
                '',
            ];
        }

        return $rows;
    }

    private function collectionRatePercent(float $payments, float $expected): float
    {
        if ($expected <= 0) {
            return 0.0;
        }

        return min(100.0, round(($payments / $expected) * 100, 1));
    }

    private function monthOverMonthPercentChange(float $current, ?float $previous): ?float
    {
        if ($previous === null) {
            return null;
        }

        if ($previous == 0.0) {
            return $current == 0.0 ? 0.0 : null;
        }

        return (($current - $previous) / $previous) * 100;
    }

    private function formatPaymentsChangePercent(?float $percent, bool $hasPrevious): string
    {
        if (! $hasPrevious || $percent === null) {
            return '—';
        }

        $rounded = round($percent, 1);
        $sign = $rounded > 0 ? '+' : '';

        return $sign.number_format($rounded, 1).'%';
    }

    /**
     * @return array<int|string, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        $headerRow = 5;
        $lastRow = count($this->monthlyBreakdown) + $headerRow;

        $styles = [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555']]],
            3 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555'], 'size' => 9]],
            $headerRow => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF0284C7'],
                ],
            ],
        ];

        if ($this->monthlyBreakdown !== []) {
            $styles[$lastRow] = ['font' => ['bold' => true]];
        }

        return $styles;
    }
}

class RevenueBillsSheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    protected $bills;

    protected $filters;

    public function __construct($bills, $filters)
    {
        $this->bills = $bills;
        $this->filters = $filters;
    }

    public function title(): string
    {
        return 'Detailed Bills';
    }

    protected function getPeriodLabel(): string
    {
        $from = $this->filters['from'] ?? null;
        $to = $this->filters['to'] ?? null;

        if ($from && $to) {
            return Carbon::parse($from)->format('M d, Y').' - '.Carbon::parse($to)->format('M d, Y');
        } elseif ($from) {
            return 'From '.Carbon::parse($from)->format('M d, Y');
        } elseif ($to) {
            return 'Up to '.Carbon::parse($to)->format('M d, Y');
        }

        return 'All Time';
    }

    public function headings(): array
    {
        return [
            ['Detailed Revenue Bills'],
            ['Period:', $this->getPeriodLabel()],
            ['Generated:', now()->format('M d, Y H:i:s')],
            [],
            [
                'Date',
                'Reference',
                'Customer Name',
                'Account Number',
                'Paid Amount',
                'Outstanding',
            ],
        ];
    }

    public function array(): array
    {
        return $this->bills;
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->mergeCells('A1:C1');

        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555']]],
            3 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555'], 'size' => 9]],
            5 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF047857'], // Emerald 700
                ],
            ],
        ];
    }
}
