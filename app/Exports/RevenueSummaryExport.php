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
    protected $summary;

    protected $filters;

    protected $bills;

    public function __construct($summary, $filters, $bills = [])
    {
        $this->summary = $summary;
        $this->filters = $filters;
        $this->bills = $bills;
    }

    public function sheets(): array
    {
        return [
            new RevenueSummarySheet($this->summary, $this->filters),
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
