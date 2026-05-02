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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('account_number')->unique();
            $table->enum('customer_type', ['residential', 'commercial', 'government']);
            $table->string('name');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('national_id')->nullable();
            $table->string('plot_no')->nullable();
            $table->text('address');
            $table->foreignId('zone_id')->constrained('zones')->onDelete('cascade');
            $table->foreignId('tariff_id')->constrained('tariffs')->onDelete('cascade');
            $table->date('connection_date')->nullable();
            $table->date('last_reading_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'disconnected'])->default('active');
            $table->timestamps();

            $table->index('zone_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
