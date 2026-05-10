<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('valves', function (Blueprint $table) {
            $table->id();
            $table->string('valve_code')->unique();
            $table->foreignId('zone_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pipe_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('valve_type', ['main', 'control', 'isolation', 'washout', 'air_release'])->default('main');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->enum('status', ['open', 'closed', 'damaged', 'maintenance'])->default('open');
            $table->date('installation_date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['valve_type', 'status']);
            $table->index('zone_id');
            $table->index('pipe_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('valves');
    }
};
