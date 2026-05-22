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
        Schema::create('commissary_orders', function (Blueprint $table) {
            $table->id();
            $table->string('idempotency_key')->nullable()->unique();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Franchisee placing order
            $table->foreignId('hub_id')->constrained()->onDelete('cascade'); // Branch receiving order
            $table->decimal('total_amount', 10, 2);
            $table->string('status')->default('pending'); // pending, preparing, out_for_delivery, delivered, cancelled
            $table->text('shipping_address');
            $table->string('contact_number');
            $table->string('payment_method')->default('cod');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('commissary_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commissary_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('wholesale_price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commissary_order_items');
        Schema::dropIfExists('commissary_orders');
    }
};
