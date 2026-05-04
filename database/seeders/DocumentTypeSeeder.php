<?php

namespace Database\Seeders;

use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'National ID', 'is_required' => true],
            ['name' => 'Employment contract', 'is_required' => true],
            ['name' => 'Academic certificate', 'is_required' => false],
            ['name' => 'Medical fitness', 'is_required' => false],
        ];

        foreach ($types as $row) {
            DocumentType::create($row);
        }
    }
}
