<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Legacy installs used status "unpaid"; new schema uses "pending".
 *
 * MySQL ENUM columns reject values not listed in the type. We widen the ENUM to
 * include both labels, migrate rows, then narrow to the final set.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bills MODIFY COLUMN status ENUM('unpaid', 'pending', 'partial', 'paid', 'forwarded') NOT NULL DEFAULT 'pending'");
        }

        DB::table('bills')->where('status', 'unpaid')->update(['status' => 'pending']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bills MODIFY COLUMN status ENUM('pending', 'partial', 'paid', 'forwarded') NOT NULL DEFAULT 'pending'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bills MODIFY COLUMN status ENUM('unpaid', 'pending', 'partial', 'paid', 'forwarded') NOT NULL DEFAULT 'pending'");
        }

        DB::table('bills')->where('status', 'pending')->update(['status' => 'unpaid']);

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE bills MODIFY COLUMN status ENUM('unpaid', 'partial', 'paid', 'forwarded') NOT NULL DEFAULT 'unpaid'");
        }
    }
};
