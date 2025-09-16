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
            $table->string('first_name', 255)->nullable();
            $table->string('last_name', 255)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('plot_number', 20)->nullable();
            $table->string('address', 255)->nullable();
            $table->decimal('credit', 10, 2)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('contract', 50)->nullable();
            $table->date('date')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->foreignId('neighborhood_id')->nullable()->constrained('neighborhoods')->onDelete('set null');
            $table->timestamps();
            
            // Foreign key constraints - make them nullable to avoid issues
            $table->foreignId('category_id')->nullable()->constrained('categories')->onDelete('set null');
            $table->foreignId('meter_id')->nullable()->constrained('meters')->onDelete('set null');

            $table->string('account_number')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            

            $table->softDeletes();
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


