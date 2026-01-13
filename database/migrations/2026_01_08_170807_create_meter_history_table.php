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
        Schema::create('meter_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_id')->constrained()->onDelete('cascade');
            $table->foreignId('meter_id')->constrained()->onDelete('cascade');
            $table->decimal('final_reading', 10, 2)->nullable();
            $table->decimal('total_consumption', 10, 2)->default(0);
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('unassigned_at')->useCurrent();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('reason')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('replaced_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_history');
    }
};
