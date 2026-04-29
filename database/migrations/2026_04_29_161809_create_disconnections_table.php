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
        Schema::create('disconnections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('notice_ends_at')->nullable();
            $table->timestamp('grace_period_ends_at')->nullable();
            $table->enum('status', ['notified', 'grace_period', 'disconnected', 'reconnected', 'cancelled'])->default('notified');
            $table->enum('disconnection_type', ['meter_removed', 'water_blocked'])->nullable();
            $table->timestamp('disconnected_at')->nullable();
            $table->timestamp('reconnected_at')->nullable();
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('disconnected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reconnected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disconnections');
    }
};
