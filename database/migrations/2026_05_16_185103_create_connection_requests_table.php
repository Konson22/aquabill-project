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
        Schema::create('connection_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('national_id')->nullable();
            $table->text('address');
            $table->string('plot_no')->nullable();
            $table->enum('customer_type', ['residential', 'commercial', 'government']);
            $table->foreignId('zone_id')->constrained('zones')->cascadeOnDelete();
            $table->foreignId('tariff_id')->constrained('tariffs')->cascadeOnDelete();
            $table->enum('status', ['pending', 'paid', 'completed', 'cancelled'])->default('pending');
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->date('issued_date');
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('issued_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connection_requests');
    }
};
