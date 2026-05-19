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
            $table->string('channel')->default('e_commerce'); // walk_in, grab, foodpanda, shopee, tiktok, e_commerce
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('flavor_modifier')->nullable(); // Spicy, Original, Toasted
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('channel');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('flavor_modifier');
        });
    }
};
