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
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('meter_id')->constrained('meters')->onDelete('cascade');
            $table->foreignId('billing_officer')->constrained('users');
            $table->integer('value');
            $table->integer('previous');
            $table->integer('illigal_connection')->default(0);
            $table->string('note', 255)->nullable();
            $table->string('source', 255)->nullable();
            $table->date('date')->nullable();
            $table->index(['customer_id', 'date']); 
            $table->timestamps();
            $table->softDeletes();
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


