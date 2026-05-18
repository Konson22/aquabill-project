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
        Schema::create('connection_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('connection_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_charge_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('connection_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('connection_request_items');
    }
};
