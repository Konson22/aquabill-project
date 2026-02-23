<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Payments for both bills and invoices (polymorphic: payable_type, payable_id).
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payable_type'); // e.g. App\Models\Bill, App\Models\Invoice
            $table->unsignedBigInteger('payable_id');
            $table->decimal('amount', 10, 2); // payment amount (this transaction)
            $table->decimal('payable_total', 10, 2)->nullable(); // bill: amount+previous_balance; invoice: amount
            $table->decimal('amount_paid', 10, 2)->default(0); // cumulative paid on payable after this payment
            $table->decimal('balance_after', 10, 2)->nullable();
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'mobile_money', 'check', 'other'])->default('cash');
            $table->string('reference_number')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['payable_type', 'payable_id']);
            $table->index('payment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
