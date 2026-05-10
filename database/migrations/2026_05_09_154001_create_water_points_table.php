<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('water_points', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('meter_no')->nullable()->unique();
            $table->string('name');
            $table->foreignId('water_point_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('zone_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('manager_name')->nullable();
            $table->string('manager_phone')->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance', 'damaged'])->default('active');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['water_point_type_id', 'status']);
            $table->index('zone_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('water_points');
    }
};
