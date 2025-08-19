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
        Schema::create('fee_master', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('fee_group_id');
            $table->unsignedBigInteger('fee_type_id');
            $table->unsignedBigInteger('class_id');
            $table->decimal('amount', 10, 2);
            $table->unsignedBigInteger('session_id');
            $table->timestamps();

            $table->foreign('fee_group_id')->references('id')->on('fee_groups')->onDelete('cascade');
            $table->foreign('fee_type_id')->references('id')->on('fee_types')->onDelete('cascade');
            $table->foreign('class_id')->references('id')->on('classes')->onDelete('cascade');
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
            
            // Ensure unique combination of fee_type, class, and session
            $table->unique(['fee_type_id', 'class_id', 'session_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_master');
    }
};
