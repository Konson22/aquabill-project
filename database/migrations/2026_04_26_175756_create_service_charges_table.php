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
        Schema::create('service_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_charge_type_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->foreignId('issued_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('issued_date');
            $table->date('due_date')->nullable();
            $table->enum('status', ['unpaid', 'paid'])->default('unpaid');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes
            $table->index('customer_id');
            $table->index('service_charge_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_charges');
    }
};
