<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('meter_id')->constrained('meters')->onDelete('cascade');
            $table->foreignId('reading_id')->constrained('meter_readings')->onDelete('cascade');
            $table->date('billing_period_start');
            $table->date('billing_period_end');
            $table->decimal('prev_balance', 12, 2)->default(0);
            $table->decimal('consumption', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('fixed_charge', 10, 2)->default(0);
            $table->decimal('other_charge', 10, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->decimal('current_balance', 12, 2)->default(0);
            $table->enum('status', ['unpaid','paid','overdue','partially_paid','balance_forwarded'])->default('unpaid');
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};


