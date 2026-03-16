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
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->foreignId('zone_id')->constrained('zones')->onDelete('restrict');
            $table->foreignId('area_id')->constrained('areas')->onDelete('restrict');
            $table->foreignId('tariff_id')->nullable()->constrained('tariffs')->onDelete('set null');
            $table->text('address')->nullable();
            $table->string('plot_number')->nullable();
            $table->string('property_type')->default('residential');
            $table->date('contract_date')->nullable();
            $table->date('meter_install_date')->nullable();
            $table->enum('supply_status', ['active', 'inactive', 'suspended', 'disconnect'])->default('active');
            $table->date('meter_disconnect_date')->nullable();
            $table->timestamps();

            $table->index('zone_id');
            $table->index('area_id');
            $table->index('tariff_id');
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
