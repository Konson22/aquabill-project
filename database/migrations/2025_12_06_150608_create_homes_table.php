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
        Schema::create('homes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('zone_id')->constrained('zones')->onDelete('restrict');
            $table->foreignId('area_id')->constrained('areas')->onDelete('restrict');
            $table->foreignId('tariff_id')->nullable()->constrained('tariffs')->onDelete('set null');
            $table->text('address');
            $table->string('plot_number')->nullable();
            $table->string('phone')->nullable();
            $table->string('property_type')->nullable();
            $table->date('contract_date')->nullable();
            $table->date('meter_install_date')->nullable();
            $table->enum('supply_status', ['active', 'suspended', 'disconnect'])->default('active');
            $table->date('meter_disconnect_date')->nullable();
            $table->timestamps();
            
            $table->index('customer_id');
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
        Schema::dropIfExists('homes');
    }
};
