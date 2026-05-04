<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->decimal('base_salary', 14, 2);
            $table->decimal('housing_allowance', 14, 2)->default(0);
            $table->decimal('transport_allowance', 14, 2)->default(0);
            $table->decimal('other_allowances', 14, 2)->default(0);
            $table->decimal('tax_rate', 5, 4)->default(0);
            $table->decimal('pension_rate', 5, 4)->default(0);
            $table->date('effective_from');
            $table->timestamps();

            $table->index(['staff_id', 'effective_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_salaries');
    }
};
