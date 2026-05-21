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
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['status', 'type', 'created_at']);
        });
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->index(['expiry_date', 'deleted_at']);
        });
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->index(['clock_in', 'clock_out']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status', 'type', 'created_at']);
        });
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->dropIndex(['expiry_date', 'deleted_at']);
        });
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->dropIndex(['clock_in', 'clock_out']);
        });
    }
};
