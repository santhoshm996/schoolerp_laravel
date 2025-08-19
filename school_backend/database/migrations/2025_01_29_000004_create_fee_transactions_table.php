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
        Schema::create('fee_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id');
            $table->unsignedBigInteger('fee_type_id');
            $table->decimal('amount_paid', 10, 2);
            $table->date('payment_date');
            $table->enum('payment_mode', ['cash', 'online', 'cheque', 'bank_transfer'])->default('cash');
            $table->string('receipt_no')->unique();
            $table->unsignedBigInteger('session_id');
            $table->unsignedBigInteger('collected_by')->nullable(); // User who collected the payment
            $table->text('notes')->nullable();
            $table->string('reference_no')->nullable(); // For online payments
            $table->timestamps();

            $table->foreign('student_id')->references('id')->on('students')->onDelete('cascade');
            $table->foreign('fee_type_id')->references('id')->on('fee_types')->onDelete('cascade');
            $table->foreign('session_id')->references('id')->on('sessions')->onDelete('cascade');
            $table->foreign('collected_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_transactions');
    }
};
