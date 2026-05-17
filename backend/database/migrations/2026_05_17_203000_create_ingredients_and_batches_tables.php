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
        // 1. Ingredients table (HQ Commissary tracking)
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('unit')->default('kg'); // kg, liters, grams, pieces
            $table->decimal('stock', 10, 2)->default(0.00);
            $table->decimal('min_stock', 10, 2)->default(10.00); // threshold for depletion alerts
            $table->timestamps();
        });

        // 2. Recipes / Product Ingredients formula
        Schema::create('product_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('ingredient_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity_required', 10, 4); // amount needed per unit of product produced
            $table->timestamps();
        });

        // 3. FIFO Inventory Batches tracking
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_number')->unique();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('hub_id')->nullable()->constrained()->onDelete('cascade'); // Null = HQ Commissary stock
            $table->integer('quantity')->default(0);
            $table->integer('initial_quantity')->default(0);
            $table->date('manufacture_date');
            $table->date('expiry_date');
            $table->boolean('discount_triggered')->default(false); // flag for automatic 30% markdown
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_batches');
        Schema::dropIfExists('product_ingredients');
        Schema::dropIfExists('ingredients');
    }
};
