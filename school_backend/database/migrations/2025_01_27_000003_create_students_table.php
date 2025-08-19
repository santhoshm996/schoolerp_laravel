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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('admission_no')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->date('dob')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();
            $table->foreignId('class_id')->constrained('classes')->onDelete('cascade');
            $table->foreignId('section_id')->constrained('sections')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['class_id', 'section_id']);
            $table->index('admission_no');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
