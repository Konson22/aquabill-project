<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pipes', function (Blueprint $table) {
            $table->id();
            $table->string('pipe_code')->unique();
            $table->foreignId('zone_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('pipe_type', ['main', 'distribution', 'service'])->default('distribution');
            $table->string('material')->nullable();
            $table->decimal('diameter', 8, 2)->nullable();
            $table->decimal('length', 10, 2)->nullable();
            $table->json('coordinates')->nullable();
            $table->enum('status', ['active', 'inactive', 'damaged', 'maintenance'])->default('active');
            $table->date('installation_date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['pipe_type', 'status']);
            $table->index('zone_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pipes');
    }
};
