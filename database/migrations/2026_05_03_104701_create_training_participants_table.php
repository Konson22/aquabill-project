<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_program_id')->constrained('training_programs')->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->enum('status', ['enrolled', 'attended', 'completed', 'absent'])->default('enrolled');
            $table->decimal('score', 7, 2)->nullable();
            $table->string('certificate_path')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['training_program_id', 'staff_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_participants');
    }
};
