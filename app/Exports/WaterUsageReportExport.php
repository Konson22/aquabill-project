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

class WaterUsageReportExport implements WithMultipleSheets
{
    /**
     * @param  array{total_consumption: float, avg_consumption: float, bills_count: int}  $summary
     * @param  array{month: string, zone_id: int|null, tariff_id: int|null, from?: string, to?: string}  $filters
     * @param  list<array{date: string, consumption: float}>  $chartData
     * @param  array{granularity: string}  $chartMeta
     * @param  list<array{name: string, consumption: float}>  $zoneData
     * @param  list<array{month: string, label: string, consumption: float, bills_count: int}>  $monthlyBreakdown
     * @param  list<array{id: int, name: string, account: string, consumption: float}>  $topConsumers
     */
    public function __construct(
        private array $summary,
        private array $filters,
        private array $chartData,
        private array $chartMeta,
        private array $zoneData,
        private array $monthlyBreakdown,
        private array $topConsumers,
    ) {}

    public function sheets(): array
    {
        return [
            new WaterUsageSummarySheet($this->summary, $this->filters),
            new WaterUsageTrendSheet($this->chartData, $this->chartMeta),
            new WaterUsageMonthlySheet($this->monthlyBreakdown, $this->summary),
            new WaterUsageZonesSheet($this->zoneData),
            new WaterUsageTopConsumersSheet($this->topConsumers),
        ];
    }
}

class WaterUsageSummarySheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    /**
     * @param  array{total_consumption: float, avg_consumption: float, bills_count: int}  $summary
     * @param  array{month: string, zone_id: int|null, tariff_id: int|null, from?: string, to?: string}  $filters
     */
    public function __construct(
        private array $summary,
        private array $filters,
    ) {}

    public function title(): string
    {
        return 'Summary';
    }

    private function periodLabel(): string
    {
        $from = $this->filters['from'] ?? null;
        $to = $this->filters['to'] ?? null;

        if ($from && $to) {
            return Carbon::parse((string) $from)->format('M d, Y').' - '.Carbon::parse((string) $to)->format('M d, Y');
        }

        return 'All';
    }

    public function headings(): array
    {
        return [
            ['Water usage report'],
            ['Period (reading date):', $this->periodLabel()],
            ['Generated:', now()->format('M d, Y H:i:s')],
            [],
            ['Metric', 'Value'],
        ];
    }

    public function array(): array
    {
        return [
            ['Total consumption (m³)', (float) ($this->summary['total_consumption'] ?? 0)],
            ['Average per bill (m³)', (float) ($this->summary['avg_consumption'] ?? 0)],
            ['Bills in period', (int) ($this->summary['bills_count'] ?? 0)],
        ];
    }

    /**
     * @return array<int|string, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        $sheet->mergeCells('A1:B1');

        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555']]],
            3 => ['font' => ['italic' => true, 'color' => ['argb' => 'FF555555']]],
            5 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF0284C7'],
                ],
            ],
        ];
    }
}

class WaterUsageTrendSheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    /**
     * @param  list<array{date: string, consumption: float}>  $chartData
     * @param  array{granularity: string}  $chartMeta
     */
    public function __construct(
        private array $chartData,
        private array $chartMeta,
    ) {}

    public function title(): string
    {
        return 'Trend';
    }

    public function headings(): array
    {
        $granularity = ($this->chartMeta['granularity'] ?? 'day') === 'month' ? 'Month' : 'Day';

        return [[$granularity, 'Consumption (m³)']];
    }

    public function array(): array
    {
        return array_map(
            fn (array $row): array => [
                $row['date'] ?? '',
                (float) ($row['consumption'] ?? 0),
            ],
            $this->chartData
        );
    }

    /**
     * @return array<int|string, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF0284C7'],
                ],
            ],
        ];
    }
}

class WaterUsageMonthlySheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    /**
     * @param  list<array{month: string, label: string, consumption: float, bills_count: int}>  $monthlyBreakdown
     * @param  array{total_consumption: float, avg_consumption: float, bills_count: int}  $summary
     */
    public function __construct(
        private array $monthlyBreakdown,
        private array $summary,
    ) {}

    public function title(): string
    {
        return 'Consumption by month';
    }

    public function headings(): array
    {
        return [[
            'Month',
            'Volume (m³)',
            'Bills generated',
            'vs last month (volume · bills)',
        ]];
    }

    public function array(): array
    {
        $rows = [];

        foreach ($this->monthlyBreakdown as $index => $row) {
            $previous = $index > 0 ? $this->monthlyBreakdown[$index - 1] : null;
            $currentConsumption = (float) ($row['consumption'] ?? 0);
            $currentBills = (int) ($row['bills_count'] ?? 0);

            $rows[] = [
                $row['label'] ?? '',
                $currentConsumption,
                $currentBills,
                $this->formatVsLastMonth(
                    $this->monthOverMonthPercentChange(
                        $currentConsumption,
                        $previous ? (float) ($previous['consumption'] ?? 0) : null,
                    ),
                    $this->monthOverMonthPercentChange(
                        (float) $currentBills,
                        $previous ? (float) ($previous['bills_count'] ?? 0) : null,
                    ),
                    $previous !== null,
                ),
            ];
        }

        if ($rows !== []) {
            $rows[] = [
                'Total',
                (float) ($this->summary['total_consumption'] ?? 0),
                (int) ($this->summary['bills_count'] ?? 0),
                '',
            ];
        }

        return $rows;
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

    private function formatPercent(?float $percent): string
    {
        if ($percent === null) {
            return '—';
        }

        $rounded = round($percent, 1);
        $sign = $rounded > 0 ? '+' : '';

        return $sign.number_format($rounded, 1).'%';
    }

    private function formatVsLastMonth(?float $volumeChangePct, ?float $billsChangePct, bool $hasPrevious): string
    {
        if (! $hasPrevious) {
            return '—';
        }

        $parts = [];

        if ($volumeChangePct !== null) {
            $parts[] = $this->formatPercent($volumeChangePct);
        }

        if ($billsChangePct !== null) {
            $parts[] = $this->formatPercent($billsChangePct);
        }

        return $parts === [] ? '—' : implode(' · ', $parts);
    }

    /**
     * @return array<int|string, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        $lastRow = count($this->monthlyBreakdown) + 1;
        $styles = [
            1 => [
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

class WaterUsageZonesSheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    /**
     * @param  list<array{name: string, consumption: float}>  $zoneData
     */
    public function __construct(private array $zoneData) {}

    public function title(): string
    {
        return 'By zone';
    }

    public function headings(): array
    {
        return [['Zone', 'Consumption (m³)']];
    }

    public function array(): array
    {
        return array_map(
            fn (array $row): array => [
                $row['name'] ?? '',
                (float) ($row['consumption'] ?? 0),
            ],
            $this->zoneData
        );
    }

    /**
     * @return array<int|string, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF0284C7'],
                ],
            ],
        ];
    }
}

class WaterUsageTopConsumersSheet implements FromArray, ShouldAutoSize, WithHeadings, WithStyles, WithTitle
{
    /**
     * @param  list<array{id: int, name: string, account: string, consumption: float}>  $topConsumers
     */
    public function __construct(private array $topConsumers) {}

    public function title(): string
    {
        return 'Top consumers';
    }

    public function headings(): array
    {
        return [['Customer', 'Account', 'Consumption (m³)']];
    }

    public function array(): array
    {
        return array_map(
            fn (array $row): array => [
                $row['name'] ?? '',
                $row['account'] ?? '',
                (float) ($row['consumption'] ?? 0),
            ],
            $this->topConsumers
        );
    }

    /**
     * @return array<int|string, array<string, mixed>>
     */
    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF0284C7'],
                ],
            ],
        ];
    }
}
