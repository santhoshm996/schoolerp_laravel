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
        // Add session_id to sections table
        Schema::table('sections', function (Blueprint $table) {
            $table->foreignId('session_id')->nullable()->constrained('sessions')->onDelete('cascade');
            $table->index('session_id');
        });

        // Add session_id to classes table
        Schema::table('classes', function (Blueprint $table) {
            $table->foreignId('session_id')->nullable()->constrained('sessions')->onDelete('cascade');
            $table->index('session_id');
        });

        // Add session_id to students table
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('session_id')->nullable()->constrained('sessions')->onDelete('cascade');
            $table->index('session_id');
        });

        // Add session_id to users table (for role-based session access)
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('session_id')->nullable()->constrained('sessions')->onDelete('set null');
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove session_id from all tables
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['session_id']);
            $table->dropColumn('session_id');
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropForeign(['session_id']);
            $table->dropColumn('session_id');
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->dropForeign(['session_id']);
            $table->dropColumn('session_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['session_id']);
            $table->dropColumn('session_id');
        });
    }
};
