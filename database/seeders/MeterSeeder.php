<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Meter;

class MeterSeeder extends Seeder
{
    public function run(): void
    {
        $meters = [
            [
                'serial' => 'WM001234567',
                'status' => 'active',
                'size' => '15mm',
                'model' => 'WM-15A',
                'manufactory' => 'AquaTech',
            ],
            [
                'serial' => 'WM001234568',
                'status' => 'active',
                'size' => '20mm',
                'model' => 'WM-20B',
                'manufactory' => 'FlowMaster',
            ],
            [
                'serial' => 'WM001234569',
                'status' => 'active',
                'size' => '25mm',
                'model' => 'WM-25C',
                'manufactory' => 'AquaTech',
            ],
            [
                'serial' => 'WM001234570',
                'status' => 'maintenance',
                'size' => '15mm',
                'model' => 'WM-15A',
                'manufactory' => 'FlowMaster',
            ],
            [
                'serial' => 'WM001234571',
                'status' => 'active',
                'size' => '32mm',
                'model' => 'WM-32D',
                'manufactory' => 'WaterPro',
            ],
            [
                'serial' => 'WM001234572',
                'status' => 'inactive',
                'size' => '15mm',
                'model' => 'WM-15A',
                'manufactory' => 'AquaTech',
            ],
            [
                'serial' => 'WM001234573',
                'status' => 'active',
                'size' => '20mm',
                'model' => 'WM-20B',
                'manufactory' => 'FlowMaster',
            ],
            [
                'serial' => 'WM001234574',
                'status' => 'active',
                'size' => '40mm',
                'model' => 'WM-40E',
                'manufactory' => 'WaterPro',
            ],
            [
                'serial' => 'WM001234575',
                'status' => 'active',
                'size' => '15mm',
                'model' => 'WM-15A',
                'manufactory' => 'AquaTech',
            ],
            [
                'serial' => 'WM001234576',
                'status' => 'active',
                'size' => '25mm',
                'model' => 'WM-25C',
                'manufactory' => 'FlowMaster',
            ],
        ];

        foreach ($meters as $meter) {
            Meter::firstOrCreate(
                ['serial' => $meter['serial']],
                $meter
            );
        }
    }
}
