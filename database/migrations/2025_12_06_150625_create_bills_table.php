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
            $table->string('bill_number')->unique();
            $table->foreignId('meter_reading_id')->constrained('meter_readings')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->date('billing_period_start');
            $table->date('billing_period_end');
            $table->decimal('tariff', 10, 2)->default(0);
            $table->decimal('fix_charges', 10, 2)->default(0);
            $table->decimal('water_consumption_volume', 10, 2)->default(0); // water consumption volume (e.g. m³) for the billing period
            $table->decimal('previous_balance', 10, 2)->default(0);
            $table->date('due_date');
            $table->enum('status', ['pending', 'fully paid', 'forwarded', 'partial paid', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->index('meter_reading_id');
            $table->index('customer_id');
            $table->index('bill_number');
            $table->index('due_date');
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

