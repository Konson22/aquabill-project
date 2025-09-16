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
        Schema::create('meter_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('old_meter_id')->nullable()->constrained('meters')->onDelete('set null');
            $table->foreignId('new_meter_id')->nullable()->constrained('meters')->onDelete('set null');
            $table->enum('action_type', [
                'initial_assignment',    // First time assigning a meter to customer
                'meter_replacement',     // Replacing old meter with new one
                'meter_removal',         // Removing meter from customer
                'meter_reactivation',    // Reactivating a previously removed meter
                'meter_transfer',        // Transferring meter to different customer
                'maintenance',           // Meter maintenance/repair
                'upgrade',               // Upgrading meter
                'downgrade'              // Downgrading meter
            ]);
            $table->text('reason')->nullable(); // Reason for the change
            $table->date('effective_date'); // When the change took effect
            $table->date('installation_date')->nullable(); // When new meter was installed
            $table->foreignId('performed_by')->constrained('users')->onDelete('cascade'); // Who made the change
            $table->json('old_meter_data')->nullable(); // Snapshot of old meter data
            $table->json('new_meter_data')->nullable(); // Snapshot of new meter data
            $table->text('notes')->nullable(); // Additional notes
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['customer_id', 'effective_date']);
            $table->index(['old_meter_id', 'new_meter_id']);
            $table->index('action_type');
            
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_logs');
    }
};
