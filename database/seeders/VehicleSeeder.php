<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\User;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        // Get some users for assignment (optional)
        $users = User::all();

        $vehicles = [
            [
                'plate_number' => 'ABC-123',
                'type' => 'Service Van',
                'status' => 'available',
                'assigned_to' => $users->isNotEmpty() ? $users->random()->id : null,
            ],
            [
                'plate_number' => 'DEF-456',
                'type' => 'Pickup Truck',
                'status' => 'in_use',
                'assigned_to' => $users->isNotEmpty() ? $users->random()->id : null,
            ],
            [
                'plate_number' => 'GHI-789',
                'type' => 'Service Van',
                'status' => 'available',
                'assigned_to' => null,
            ],
            [
                'plate_number' => 'JKL-012',
                'type' => 'Utility Truck',
                'status' => 'maintenance',
                'assigned_to' => null,
            ],
            [
                'plate_number' => 'MNO-345',
                'type' => 'Pickup Truck',
                'status' => 'available',
                'assigned_to' => $users->isNotEmpty() ? $users->random()->id : null,
            ],
            [
                'plate_number' => 'PQR-678',
                'type' => 'Service Van',
                'status' => 'in_use',
                'assigned_to' => $users->isNotEmpty() ? $users->random()->id : null,
            ],
            [
                'plate_number' => 'STU-901',
                'type' => 'Utility Truck',
                'status' => 'available',
                'assigned_to' => null,
            ],
            [
                'plate_number' => 'VWX-234',
                'type' => 'Pickup Truck',
                'status' => 'maintenance',
                'assigned_to' => null,
            ],
            [
                'plate_number' => 'YZA-567',
                'type' => 'Service Van',
                'status' => 'available',
                'assigned_to' => $users->isNotEmpty() ? $users->random()->id : null,
            ],
            [
                'plate_number' => 'BCD-890',
                'type' => 'Utility Truck',
                'status' => 'in_use',
                'assigned_to' => $users->isNotEmpty() ? $users->random()->id : null,
            ],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::firstOrCreate(
                ['plate_number' => $vehicle['plate_number']],
                $vehicle
            );
        }
    }
}
