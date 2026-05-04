<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained('payrolls')->cascadeOnDelete();
            $table->enum('type', ['bonus', 'deduction']);
            $table->decimal('amount', 14, 2);
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('payroll_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_adjustments');
    }
};
