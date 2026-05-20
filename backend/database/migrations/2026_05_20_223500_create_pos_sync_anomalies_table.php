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
        Schema::create('pos_sync_anomalies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hub_id')->constrained()->onDelete('cascade');
            $table->string('offline_order_id');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('requested_quantity');
            $table->integer('available_quantity');
            $table->string('status')->default('pending'); // pending, resolved
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_sync_anomalies');
    }
};
