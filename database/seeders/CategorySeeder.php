<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Commercial Categories
            ['name' => 'Constructions (Commercial)', 'type_id' => 'C', 'tariff' => 3000.00, 'fixed_charge' => 0.00],
            ['name' => 'Company (Commercial)', 'type_id' => 'Co', 'tariff' => 46650.00, 'fixed_charge' => 0.00],
            ['name' => 'Factories (Commercial)', 'type_id' => 'F', 'tariff' => 10000.00, 'fixed_charge' => 0.00],
            ['name' => 'Guest House (Commercial)', 'type_id' => 'Gh', 'tariff' => 2000.00, 'fixed_charge' => 0.00],
            ['name' => 'Hotels (Large)', 'type_id' => 'Htl', 'tariff' => 3000.00, 'fixed_charge' => 0.00],
            ['name' => 'Hotels (Small)', 'type_id' => 'Htls', 'tariff' => 2000.00, 'fixed_charge' => 0.00],
            ['name' => 'Hotels (Medium)', 'type_id' => 'Htm', 'tariff' => 3000.00, 'fixed_charge' => 0.00],
            ['name' => 'Offices', 'type_id' => 'Of', 'tariff' => 800.00, 'fixed_charge' => 0.00],
            ['name' => 'Public Latrines (Commercial)', 'type_id' => 'Pl', 'tariff' => 1800.00, 'fixed_charge' => 0.00],
            ['name' => 'Petrol Station', 'type_id' => 'Ps', 'tariff' => 1800.00, 'fixed_charge' => 0.00],
            ['name' => 'Restaurant (Commercial)', 'type_id' => 'Re', 'tariff' => 0.00, 'fixed_charge' => 0.00],
            
            // Domestic Categories
            ['name' => 'Domestic Class1', 'type_id' => 'C1', 'tariff' => 900.00, 'fixed_charge' => 0.00],
            ['name' => 'Domestic Class2', 'type_id' => 'C2', 'tariff' => 864.00, 'fixed_charge' => 0.00],
            ['name' => 'Domestic Class3', 'type_id' => 'C3', 'tariff' => 864.00, 'fixed_charge' => 0.00],
            
            // Religious Categories
            ['name' => 'Churches (Large)', 'type_id' => 'Chl', 'tariff' => 450.00, 'fixed_charge' => 0.00],
            ['name' => 'Churches (Medium)', 'type_id' => 'Chm', 'tariff' => 450.00, 'fixed_charge' => 0.00],
            ['name' => 'Churches (Small)', 'type_id' => 'Chs', 'tariff' => 450.00, 'fixed_charge' => 0.00],
            ['name' => 'Mosques (Large)', 'type_id' => 'Mql', 'tariff' => 450.00, 'fixed_charge' => 0.00],
            ['name' => 'Mosques (Medium)', 'type_id' => 'Mqm', 'tariff' => 450.00, 'fixed_charge' => 0.00],
            ['name' => 'Mosques (Small)', 'type_id' => 'Mqs', 'tariff' => 450.00, 'fixed_charge' => 0.00],
            
            // Healthcare Categories
            ['name' => 'Clinics (Commercial)', 'type_id' => 'Cl', 'tariff' => 2000.00, 'fixed_charge' => 0.00],
            ['name' => 'Hospitals', 'type_id' => 'Hp', 'tariff' => 60.00, 'fixed_charge' => 0.00],
            
            // Educational Categories
            ['name' => 'College (Commercial)', 'type_id' => 'Col', 'tariff' => 0.00, 'fixed_charge' => 0.00],
            ['name' => 'Schools (Government)', 'type_id' => 'Scg', 'tariff' => 1000.00, 'fixed_charge' => 0.00],
            ['name' => 'Schools (Private)', 'type_id' => 'Scp', 'tariff' => 0.00, 'fixed_charge' => 0.00],
            
            // Government & Institutional Categories
            ['name' => 'Government (Unit)', 'type_id' => 'G', 'tariff' => 3000.00, 'fixed_charge' => 0.00],
            ['name' => 'Institutions', 'type_id' => 'In', 'tariff' => 3000.00, 'fixed_charge' => 0.00],
            ['name' => 'Military Barack', 'type_id' => 'M', 'tariff' => 3000.00, 'fixed_charge' => 0.00],
            ['name' => 'NGOs', 'type_id' => 'N', 'tariff' => 3000.00, 'fixed_charge' => 0.00],
            
            // Special Categories
            ['name' => 'Mezulium', 'type_id' => 'Moz', 'tariff' => 0.00, 'fixed_charge' => 0.00],
            ['name' => 'New Construction', 'type_id' => 'Nc', 'tariff' => 0.00, 'fixed_charge' => 0.00],
            ['name' => 'Public Tap Stand', 'type_id' => 'PTS', 'tariff' => 0.00, 'fixed_charge' => 0.00],
            ['name' => 'Stand Pipes', 'type_id' => 'Sp', 'tariff' => 60.00, 'fixed_charge' => 0.00],
        ];

        foreach ($categories as $data) {
            Category::firstOrCreate(['type_id' => $data['type_id']], $data);
        }
    }
}


