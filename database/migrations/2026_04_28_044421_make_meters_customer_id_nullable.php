<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meters', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
        });

        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement('ALTER TABLE `meters` MODIFY `customer_id` BIGINT UNSIGNED NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE meters ALTER COLUMN customer_id DROP NOT NULL');
        } else {
            // SQLite: column change without doctrine/dbal
            Schema::table('meters', function (Blueprint $table) {
                $table->unsignedBigInteger('customer_id')->nullable()->change();
            });
        }

        Schema::table('meters', function (Blueprint $table) {
            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('meters', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
        });

        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::table('meters')->whereNull('customer_id')->delete();
            DB::statement('ALTER TABLE `meters` MODIFY `customer_id` BIGINT UNSIGNED NOT NULL');
        } elseif ($driver === 'pgsql') {
            DB::table('meters')->whereNull('customer_id')->delete();
            DB::statement('ALTER TABLE meters ALTER COLUMN customer_id SET NOT NULL');
        } else {
            Schema::table('meters', function (Blueprint $table) {
                $table->unsignedBigInteger('customer_id')->nullable(false)->change();
            });
        }

        Schema::table('meters', function (Blueprint $table) {
            $table->foreign('customer_id')
                ->references('id')
                ->on('customers')
                ->onDelete('cascade');
        });
    }
};
