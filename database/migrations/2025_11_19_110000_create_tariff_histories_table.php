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
        Schema::create('tariff_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->decimal('unit_price', 10, 2);
            $table->decimal('fixed_charge', 10, 2)->default(0);
            $table->unsignedInteger('min_consumption')->default(0);
            $table->unsignedInteger('max_consumption')->nullable();
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->enum('status', ['pending', 'active', 'expired'])->default('pending');
            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('change_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tariff_histories');
    }
};

