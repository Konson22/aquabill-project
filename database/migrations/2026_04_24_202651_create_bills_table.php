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
            $table->string('bill_no')->unique();

            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('meter_number')->nullable();
            $table->unsignedBigInteger('meter_id');
            $table->foreignId('reading_id')->constrained('meter_readings')->onDelete('cascade');

            $table->decimal('consumption', 10, 2);
            $table->decimal('unit_price', 10, 2); // Snapshot
            $table->decimal('fixed_charge', 10, 2); // Snapshot
            $table->decimal('current_charge', 10, 2);
            $table->decimal('previous_balance', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            $table->enum('status', ['unpaid', 'partial', 'paid', 'forwarded'])->default('unpaid');
            $table->date('due_date');

            $table->timestamps();

            // Prevent duplicate bills for the same reading
            $table->unique('reading_id');
            $table->index('meter_number');
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
