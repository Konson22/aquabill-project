<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates canonical supply weekdays, links zones via supply_day_id, and migrates legacy zones.supply_day strings when present.
     */
    public function up(): void
    {
        Schema::create('supply_days', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->boolean('is_reserve')->default(false)->comment('When true, any zone may be resupplied on this weekday');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        $now = now();
        $rows = [
            ['Monday', 1],
            ['Tuesday', 2],
            ['Wednesday', 3],
            ['Thursday', 4],
            ['Friday', 5],
            ['Saturday', 6],
            ['Sunday', 7],
            ['Daily', 8],
        ];

        $reserveDays = ['Saturday', 'Sunday'];

        foreach ($rows as [$name, $order]) {
            DB::table('supply_days')->insert([
                'name' => $name,
                'sort_order' => $order,
                'is_reserve' => in_array($name, $reserveDays, true),
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        if (Schema::hasTable('zones') && Schema::hasColumn('zones', 'supply_day')) {
            $nameToId = DB::table('supply_days')->pluck('id', 'name');
            $zones = DB::table('zones')->select('id', 'supply_day')->whereNotNull('supply_day')->get();

            foreach ($zones as $zone) {
                $id = $nameToId[$zone->supply_day] ?? null;
                if ($id !== null) {
                    DB::table('zones')->where('id', $zone->id)->update(['supply_day_id' => $id]);
                }
            }

            Schema::table('zones', function (Blueprint $table) {
                $table->dropColumn('supply_day');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('zones') && ! Schema::hasColumn('zones', 'supply_day')) {
            Schema::table('zones', function (Blueprint $table) {
                $table->string('supply_day')->nullable()->after('name');
            });
        }

        Schema::dropIfExists('supply_days');
    }
};
