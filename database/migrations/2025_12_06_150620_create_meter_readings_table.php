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
        Schema::create('meter_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_id')->constrained('homes')->onDelete('cascade');
            $table->foreignId('meter_id')->constrained('meters')->onDelete('cascade');
            $table->date('reading_date');
            $table->string('image')->nullable();
            $table->decimal('current_reading', 10, 2);
            $table->decimal('previous_reading', 10, 2)->nullable();
            $table->foreignId('read_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'billed', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();
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

