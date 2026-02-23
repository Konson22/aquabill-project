<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * When a meter_reading is deleted: related bills are cascade-deleted (bills.meter_reading_id
     * has onDelete('cascade')). Payments for those bills are deleted in MeterReading::deleting.
     */
    public function up(): void
    {
        Schema::create('meter_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('meter_id')->constrained('meters')->onDelete('cascade');
            $table->date('reading_date');
            $table->string('image')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('current_reading', 10, 2);
            $table->decimal('previous_reading', 10, 2)->nullable();
            $table->boolean('is_initial')->default(false);
            $table->foreignId('read_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'billed', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();
            $table->index('customer_id');
            $table->index('meter_id');
            $table->index('reading_date');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_readings');
    }
};

