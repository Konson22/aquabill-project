<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->date('attendance_date');
            $table->time('clock_in')->nullable();
            $table->time('clock_out')->nullable();
            $table->enum('status', ['present', 'absent', 'late', 'half_day', 'on_leave', 'holiday']);
            $table->unsignedInteger('late_minutes')->default(0);
            $table->unsignedInteger('worked_minutes')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['staff_id', 'attendance_date']);
            $table->index('attendance_date');
            $table->index(['staff_id', 'attendance_date']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_attendances');
    }
};
