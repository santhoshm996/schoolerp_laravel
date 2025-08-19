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
        Schema::create('parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->string('father_name')->nullable();
            $table->string('father_phone')->nullable();
            $table->string('father_email')->nullable();
            $table->string('father_photo')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('mother_phone')->nullable();
            $table->string('mother_email')->nullable();
            $table->string('mother_photo')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parents');
    }
};
