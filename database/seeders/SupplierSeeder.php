<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Supplier;

class SupplierSeeder extends Seeder
{
    public function run(): void
    {
        $suppliers = [
            [
                'name' => 'AquaTech Solutions',
                'contact_person' => 'John Smith',
                'phone' => '+1-555-0101',
                'email' => 'john.smith@aquatech.com',
                'address' => '123 Water Street, Hydropolis, HP 12345',
            ],
            [
                'name' => 'FlowMaster Industries',
                'contact_person' => 'Sarah Johnson',
                'phone' => '+1-555-0102',
                'email' => 'sarah.johnson@flowmaster.com',
                'address' => '456 Pipeline Avenue, Flow City, FC 67890',
            ],
            [
                'name' => 'WaterPro Equipment',
                'contact_person' => 'Michael Brown',
                'phone' => '+1-555-0103',
                'email' => 'michael.brown@waterpro.com',
                'address' => '789 Reservoir Road, Aqua Town, AT 11111',
            ],
            [
                'name' => 'HydroSupply Co.',
                'contact_person' => 'Emily Davis',
                'phone' => '+1-555-0104',
                'email' => 'emily.davis@hydrosupply.com',
                'address' => '321 Well Street, Waterford, WF 22222',
            ],
            [
                'name' => 'PureWater Systems',
                'contact_person' => 'David Wilson',
                'phone' => '+1-555-0105',
                'email' => 'david.wilson@purewater.com',
                'address' => '654 Filtration Lane, Clean City, CC 33333',
            ],
            [
                'name' => 'AquaParts Direct',
                'contact_person' => 'Lisa Anderson',
                'phone' => '+1-555-0106',
                'email' => 'lisa.anderson@aquaparts.com',
                'address' => '987 Component Court, Partsville, PV 44444',
            ],
            [
                'name' => 'WaterWorks Ltd.',
                'contact_person' => 'Robert Taylor',
                'phone' => '+1-555-0107',
                'email' => 'robert.taylor@waterworks.com',
                'address' => '147 Maintenance Way, Service City, SC 55555',
            ],
            [
                'name' => 'FlowControl Inc.',
                'contact_person' => 'Maria Garcia',
                'phone' => '+1-555-0108',
                'email' => 'maria.garcia@flowcontrol.com',
                'address' => '258 Valve Street, Control Town, CT 66666',
            ],
            [
                'name' => 'AquaMaintenance Pro',
                'contact_person' => 'James Martinez',
                'phone' => '+1-555-0109',
                'email' => 'james.martinez@aquamaintenance.com',
                'address' => '369 Repair Road, Fix City, FC 77777',
            ],
            [
                'name' => 'WaterTech Solutions',
                'contact_person' => 'Jennifer Lee',
                'phone' => '+1-555-0110',
                'email' => 'jennifer.lee@watertech.com',
                'address' => '741 Innovation Drive, Tech City, TC 88888',
            ],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::firstOrCreate(
                ['name' => $supplier['name']],
                $supplier
            );
        }
    }
}
