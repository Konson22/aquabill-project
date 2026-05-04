<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_program_id')->constrained('training_programs')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('file_path');
            $table->timestamps();

            $table->index('training_program_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_documents');
    }
};
