<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Customer;
use App\Models\Home;
use App\Models\Zone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HomeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        $zones = Zone::all();
        $areas = Area::all();

        if ($customers->isEmpty() || $zones->isEmpty() || $areas->isEmpty()) {
            $this->command->warn('Please run ZoneSeeder, AreaSeeder, and CustomerSeeder first.');
            return;
        }

        $homes = [
            [
                'customer' => 'John Doe',
                'zone' => 'North Zone',
                'area' => 'North Area 1',
                'address' => '123 Main Street, North Area',
                'plot_number' => 'N-001',
                'phone' => '+1234567890',
                'property_type' => 'Residential',
            ],
            [
                'customer' => 'John Doe',
                'zone' => 'South Zone',
                'area' => 'South Area 1',
                'address' => '456 Oak Avenue, South Area',
                'plot_number' => 'S-001',
                'phone' => '+1234567890',
                'property_type' => 'Commercial',
            ],
            [
                'customer' => 'Jane Smith',
                'zone' => 'East Zone',
                'area' => 'East Area 1',
                'address' => '789 Pine Road, East Area',
                'plot_number' => 'E-001',
                'phone' => '+1234567891',
                'property_type' => 'Residential',
            ],
            [
                'customer' => 'Robert Johnson',
                'zone' => 'West Zone',
                'area' => 'West Area 1',
                'address' => '321 Elm Street, West Area',
                'plot_number' => 'W-001',
                'phone' => '+1234567892',
                'property_type' => 'Residential',
            ],
            [
                'customer' => 'Maria Garcia',
                'zone' => 'North Zone',
                'area' => 'North Area 2',
                'address' => '654 Maple Drive, North Area',
                'plot_number' => 'N-002',
                'phone' => '+1234567893',
                'property_type' => 'Residential',
            ],
            [
                'customer' => 'Ahmed Hassan',
                'zone' => 'South Zone',
                'area' => 'South Area 2',
                'address' => '987 Cedar Lane, South Area',
                'plot_number' => 'S-002',
                'phone' => '+1234567894',
                'property_type' => 'Residential',
            ],
        ];

        foreach ($homes as $homeData) {
            $customer = $customers->firstWhere('name', $homeData['customer']);
            $zone = $zones->firstWhere('name', $homeData['zone']);
            $area = $areas->firstWhere('name', $homeData['area']);

            if ($customer && $zone && $area) {
                Home::create([
                    'customer_id' => $customer->id,
                    'zone_id' => $zone->id,
                    'area_id' => $area->id,
                    'tariff_id' => \App\Models\Tariff::inRandomOrder()->first()->id ?? null,
                    'address' => $homeData['address'],
                    'plot_number' => $homeData['plot_number'],
                    'phone' => $homeData['phone'],
                    'property_type' => $homeData['property_type'],
                ]);
            }
        }
    }
}
