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
     * supply_schedules: versioned weekly plan per zone (effective_from / effective_to).
     * supply_histories: log of actual supply runs, including reserve-day resupply for any area.
     */
    public function up(): void
    {
        Schema::create('supply_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('zones')->cascadeOnDelete();
            $table->foreignId('supply_day_id')->constrained('supply_days')->restrictOnDelete();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['zone_id', 'effective_to']);
            $table->index(['zone_id', 'supply_day_id', 'effective_to']);
        });

        Schema::create('supply_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('zones')->cascadeOnDelete();
            $table->foreignId('supply_day_id')->nullable()->constrained('supply_days')->nullOnDelete();
            $table->foreignId('supply_schedule_id')->nullable()->constrained('supply_schedules')->nullOnDelete();
            $table->date('supplied_on');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->enum('kind', ['scheduled', 'reserve', 'makeup'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['zone_id', 'supplied_on']);
            $table->index(['supplied_on', 'kind']);
        });

        if (! Schema::hasTable('zones')) {
            return;
        }

        $hasDay = Schema::hasColumn('zones', 'supply_day_id');
        $hasTime = Schema::hasColumn('zones', 'supply_time');

        if ($hasDay || $hasTime) {
            $select = ['id'];
            if ($hasDay) {
                $select[] = 'supply_day_id';
            }
            if ($hasTime) {
                $select[] = 'supply_time';
            }

            $zones = DB::table('zones')->select($select)->get();
            $now = now();
            $effectiveFrom = $now->toDateString();

            foreach ($zones as $zone) {
                $dayId = $hasDay ? $zone->supply_day_id : null;
                if ($dayId === null) {
                    continue;
                }

                DB::table('supply_schedules')->insert([
                    'zone_id' => $zone->id,
                    'supply_day_id' => $dayId,
                    'start_time' => $hasTime ? $zone->supply_time : null,
                    'end_time' => null,
                    'effective_from' => $effectiveFrom,
                    'effective_to' => null,
                    'notes' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        Schema::table('zones', function (Blueprint $table) use ($hasDay, $hasTime) {
            if ($hasDay) {
                $table->dropForeign(['supply_day_id']);
                $table->dropColumn('supply_day_id');
            }
            if ($hasTime) {
                $table->dropColumn('supply_time');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supply_histories');

        if (Schema::hasTable('zones')) {
            Schema::table('zones', function (Blueprint $table) {
                if (! Schema::hasColumn('zones', 'supply_day_id')) {
                    $table->foreignId('supply_day_id')
                        ->nullable()
                        ->after('name')
                        ->constrained('supply_days');
                }
                if (! Schema::hasColumn('zones', 'supply_time')) {
                    $table->time('supply_time')->nullable()->after('supply_day_id');
                }
            });

            if (Schema::hasTable('supply_schedules')) {
                $schedules = DB::table('supply_schedules')
                    ->select('zone_id', 'supply_day_id', 'start_time')
                    ->whereNull('effective_to')
                    ->orderBy('id')
                    ->get()
                    ->unique('zone_id');

                foreach ($schedules as $schedule) {
                    DB::table('zones')->where('id', $schedule->zone_id)->update([
                        'supply_day_id' => $schedule->supply_day_id,
                        'supply_time' => $schedule->start_time,
                    ]);
                }
            }
        }

        Schema::dropIfExists('supply_schedules');
    }
};
