<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryItem;

class InventoryItemSeeder extends Seeder
{
    public function run(): void
    {
        $inventoryItems = [
            [
                'item_name' => 'Water Meter 15mm',
                'category' => 'Meters',
                'description' => 'Digital water meter for residential use',
                'unit' => 'pieces',
                'quantity_available' => 50,
                'reorder_level' => 10,
            ],
            [
                'item_name' => 'Water Meter 20mm',
                'category' => 'Meters',
                'description' => 'Digital water meter for small commercial use',
                'unit' => 'pieces',
                'quantity_available' => 30,
                'reorder_level' => 8,
            ],
            [
                'item_name' => 'Water Meter 25mm',
                'category' => 'Meters',
                'description' => 'Digital water meter for medium commercial use',
                'unit' => 'pieces',
                'quantity_available' => 20,
                'reorder_level' => 5,
            ],
            [
                'item_name' => 'Gate Valve 2 inch',
                'category' => 'Valves',
                'description' => 'Bronze gate valve for main water lines',
                'unit' => 'pieces',
                'quantity_available' => 25,
                'reorder_level' => 5,
            ],
            [
                'item_name' => 'Gate Valve 4 inch',
                'category' => 'Valves',
                'description' => 'Bronze gate valve for large water lines',
                'unit' => 'pieces',
                'quantity_available' => 15,
                'reorder_level' => 3,
            ],
            [
                'item_name' => 'PVC Pipe 1/2 inch',
                'category' => 'Pipes',
                'description' => 'PVC water pipe for residential connections',
                'unit' => 'meters',
                'quantity_available' => 500,
                'reorder_level' => 100,
            ],
            [
                'item_name' => 'PVC Pipe 3/4 inch',
                'category' => 'Pipes',
                'description' => 'PVC water pipe for small commercial connections',
                'unit' => 'meters',
                'quantity_available' => 300,
                'reorder_level' => 75,
            ],
            [
                'item_name' => 'PVC Pipe 1 inch',
                'category' => 'Pipes',
                'description' => 'PVC water pipe for medium commercial connections',
                'unit' => 'meters',
                'quantity_available' => 200,
                'reorder_level' => 50,
            ],
            [
                'item_name' => 'Pipe Fitting Elbow 90°',
                'category' => 'Fittings',
                'description' => 'PVC elbow fitting for pipe direction changes',
                'unit' => 'pieces',
                'quantity_available' => 100,
                'reorder_level' => 20,
            ],
            [
                'item_name' => 'Pipe Fitting Tee',
                'category' => 'Fittings',
                'description' => 'PVC tee fitting for pipe branching',
                'unit' => 'pieces',
                'quantity_available' => 80,
                'reorder_level' => 15,
            ],
            [
                'item_name' => 'Pipe Fitting Reducer',
                'category' => 'Fittings',
                'description' => 'PVC reducer fitting for pipe size changes',
                'unit' => 'pieces',
                'quantity_available' => 60,
                'reorder_level' => 12,
            ],
            [
                'item_name' => 'Pipe Wrench 12 inch',
                'category' => 'Tools',
                'description' => 'Adjustable pipe wrench for installation',
                'unit' => 'pieces',
                'quantity_available' => 20,
                'reorder_level' => 5,
            ],
            [
                'item_name' => 'Pipe Wrench 18 inch',
                'category' => 'Tools',
                'description' => 'Large adjustable pipe wrench for heavy duty work',
                'unit' => 'pieces',
                'quantity_available' => 15,
                'reorder_level' => 3,
            ],
            [
                'item_name' => 'Teflon Tape',
                'category' => 'Sealants',
                'description' => 'Thread seal tape for pipe connections',
                'unit' => 'rolls',
                'quantity_available' => 50,
                'reorder_level' => 10,
            ],
            [
                'item_name' => 'Pipe Joint Compound',
                'category' => 'Sealants',
                'description' => 'Liquid sealant for threaded connections',
                'unit' => 'tubes',
                'quantity_available' => 30,
                'reorder_level' => 8,
            ],
            [
                'item_name' => 'Water Pressure Gauge',
                'category' => 'Instruments',
                'description' => 'Digital pressure gauge for system monitoring',
                'unit' => 'pieces',
                'quantity_available' => 25,
                'reorder_level' => 5,
            ],
            [
                'item_name' => 'Flow Meter',
                'category' => 'Instruments',
                'description' => 'Portable flow meter for testing',
                'unit' => 'pieces',
                'quantity_available' => 10,
                'reorder_level' => 2,
            ],
            [
                'item_name' => 'Water Quality Test Kit',
                'category' => 'Testing',
                'description' => 'Complete water quality testing equipment',
                'unit' => 'kits',
                'quantity_available' => 8,
                'reorder_level' => 2,
            ],
            [
                'item_name' => 'Chlorine Test Strips',
                'category' => 'Testing',
                'description' => 'Disposable strips for chlorine level testing',
                'unit' => 'boxes',
                'quantity_available' => 20,
                'reorder_level' => 5,
            ],
            [
                'item_name' => 'Safety Helmet',
                'category' => 'Safety',
                'description' => 'Hard hat for construction site safety',
                'unit' => 'pieces',
                'quantity_available' => 30,
                'reorder_level' => 8,
            ],
        ];

        foreach ($inventoryItems as $item) {
            InventoryItem::firstOrCreate(
                ['item_name' => $item['item_name']],
                $item
            );
        }
    }
}
