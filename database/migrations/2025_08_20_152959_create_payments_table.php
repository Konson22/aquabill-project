<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('bill_id')->nullable()->constrained('bills')->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('cascade');
            $table->date('payment_date');
            $table->decimal('amount_paid', 12, 2);
            $table->enum('payment_method', ['cash','mobile_money','bank_transfer']);
            $table->string('reference_number')->nullable();
            $table->foreignId('received_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
        
        // Ensure that either bill_id or invoice_id is provided, but not both
        // Only add this constraint for MySQL/PostgreSQL, not SQLite
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE payments ADD CONSTRAINT check_payment_reference CHECK ((bill_id IS NOT NULL AND invoice_id IS NULL) OR (bill_id IS NULL AND invoice_id IS NOT NULL))');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};


