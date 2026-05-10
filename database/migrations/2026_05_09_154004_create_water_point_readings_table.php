<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('water_point_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('water_point_id')->constrained()->cascadeOnDelete();
            $table->string('meter_no')->nullable();
            $table->date('reading_date');
            $table->decimal('previous_reading', 10, 2);
            $table->decimal('current_reading', 10, 2);
            $table->decimal('consumption', 10, 2);
            $table->string('image')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->boolean('is_initial')->default(false);
            $table->timestamps();

            $table->index('meter_no');
            $table->index('reading_date');
            $table->index('is_initial');
            $table->index(['water_point_id', 'reading_date']);
            $table->index(['meter_no', 'reading_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('water_point_readings');
    }
};
