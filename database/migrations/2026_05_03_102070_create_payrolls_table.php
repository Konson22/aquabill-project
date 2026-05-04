<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained('payroll_periods')->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->decimal('basic_salary', 14, 2)->default(0);
            $table->decimal('allowances', 14, 2)->default(0);
            $table->decimal('deductions', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('pension_amount', 14, 2)->default(0);
            $table->decimal('net_salary', 14, 2)->default(0);
            $table->unsignedSmallInteger('working_days')->nullable();
            $table->decimal('present_days', 6, 2)->nullable();
            $table->decimal('leave_days', 6, 2)->nullable();
            $table->decimal('absent_days', 6, 2)->nullable();
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['payroll_period_id', 'staff_id']);
            $table->index('staff_id');
            $table->index('payroll_period_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
