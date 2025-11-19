<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AddressSeeder extends Seeder
{
    public function run(): void
    {
        $addressBook = [
            'admin@gmail.com' => '123 Utility Plaza, City Center',
        ];

        foreach ($addressBook as $email => $address) {
            $user = User::where('email', $email)->first();

            if (!$user) {
                $this->command?->warn("Skipping address seeding for {$email}: user not found.");
                continue;
            }

            DB::table('address')->updateOrInsert(
                ['user_id' => $user->id],
                [
                    'address' => $address,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}

