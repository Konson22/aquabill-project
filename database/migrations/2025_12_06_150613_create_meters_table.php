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
        Schema::create('meters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_id')->nullable()->constrained('homes')->onDelete('cascade');
            $table->string('meter_number')->unique();
            $table->string('meter_type')->nullable();
            $table->date('installation_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance', 'disconnect', 'damage'])->default('active');
            $table->timestamps();
            
            $table->index('home_id');
            $table->index('meter_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meters');
    }
};
