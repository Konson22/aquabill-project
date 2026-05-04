<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->decimal('entitled_days', 6, 2)->default(0);
            $table->decimal('used_days', 6, 2)->default(0);
            $table->decimal('remaining_days', 6, 2)->default(0);
            $table->timestamps();

            $table->unique(['staff_id', 'leave_type_id', 'year']);
            $table->index('year');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_leave_balances');
    }
};
