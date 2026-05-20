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
        // 1. Optimize orders table for user_id, hub_id, type, status, channel filtering
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'orders_user_status_index');
            $table->index(['hub_id', 'type', 'status'], 'orders_hub_type_status_index');
            $table->index('channel', 'orders_channel_index');
        });

        // 2. Optimize inventory_batches for FIFO and expiration sorting
        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->index(['hub_id', 'product_id', 'expiry_date'], 'batches_hub_product_expiry_index');
            $table->index('discount_triggered', 'batches_discount_triggered_index');
        });

        // 3. Optimize work_shifts for active session checks & cashier history
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'shifts_user_status_index');
            $table->index(['hub_id', 'clock_in'], 'shifts_hub_clock_in_index');
        });

        // 4. Optimize payouts for cashier filtering & payroll status
        Schema::table('payouts', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'payouts_user_status_index');
            $table->index(['hub_id', 'status'], 'payouts_hub_status_index');
        });

        // 5. Optimize expenses for category aggregates and monthly reports
        Schema::table('expenses', function (Blueprint $table) {
            $table->index(['hub_id', 'category', 'date'], 'expenses_hub_category_date_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex('expenses_hub_category_date_index');
        });

        Schema::table('payouts', function (Blueprint $table) {
            $table->dropIndex('payouts_user_status_index');
            $table->dropIndex('payouts_hub_status_index');
        });

        Schema::table('work_shifts', function (Blueprint $table) {
            $table->dropIndex('shifts_user_status_index');
            $table->dropIndex('shifts_hub_clock_in_index');
        });

        Schema::table('inventory_batches', function (Blueprint $table) {
            $table->dropIndex('batches_hub_product_expiry_index');
            $table->dropIndex('batches_discount_triggered_index');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_user_status_index');
            $table->dropIndex('orders_hub_type_status_index');
            $table->dropIndex('orders_channel_index');
        });
    }
};
