<?php

namespace Database\Seeders;

use App\Models\ServiceChargeType;
use Illuminate\Database\Seeder;

class ServiceChargeTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Installation Fee',
                'code' => 'INSTALL_FEE',
                'amount' => 50.00,
                'description' => 'Fee for new water connection and installation.',
            ],
            [
                'name' => 'Reconnection Fee',
                'code' => 'RECON_FEE',
                'amount' => 20.00,
                'description' => 'Fee for reconnecting a disconnected service.',
            ],
            [
                'name' => 'Meter Replacement Fee',
                'code' => 'METER_REPLACE',
                'amount' => 25.00,
                'description' => 'Fee for replacing a damaged or faulty meter.',
            ],
            [
                'name' => 'Inspection Fee',
                'code' => 'INSPECT_FEE',
                'amount' => 15.00,
                'description' => 'Fee for technical inspection of the water system.',
            ],
        ];

        foreach ($types as $type) {
            ServiceChargeType::updateOrCreate(['code' => $type['code']], $type);
        }
    }
}
