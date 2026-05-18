<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\ProductIngredient;
use App\Models\InventoryBatch;
use App\Models\Product;
use App\Services\InventoryBatchService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    protected InventoryBatchService $batchService;

    public function __construct(InventoryBatchService $batchService)
    {
        $this->batchService = $batchService;
    }

    public function getBatches()
    {
        $batches = InventoryBatch::with(['product', 'hub'])->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $batches
        ]);
    }

    public function storeBatch(Request $request)
    {
        $data = $request->validate([
            'batch_number' => 'required|string|unique:inventory_batches,batch_number',
            'product_id' => 'required|exists:products,id',
            'hub_id' => 'nullable|exists:hubs,id',
            'initial_quantity' => 'required|integer|min:1',
            'manufacture_date' => 'required|date',
            'expiry_date' => 'required|date|after_or_equal:manufacture_date',
        ]);

        try {
            $batch = $this->batchService->createBatch($data);
            return response()->json([
                'success' => true,
                'message' => 'Inventory batch logged and HQ ingredients depleted successfully!',
                'data' => $batch
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function triggerMarkdown()
    {
        $count = $this->batchService->triggerCloseToExpiryDiscounts();
        return response()->json([
            'success' => true,
            'message' => "Successfully scanned and marked {$count} batches near expiration for 30% markdown!",
            'data' => ['discounted_count' => $count]
        ]);
    }

    public function getIngredients()
    {
        return response()->json([
            'success' => true,
            'data' => Ingredient::latest()->get()
        ]);
    }

    public function storeIngredient(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|unique:ingredients,name',
            'unit' => 'required|string',
            'stock' => 'required|numeric|min:0',
            'min_stock' => 'required|numeric|min:0',
            'unit_cost' => 'nullable|numeric|min:0'
        ]);

        $ingredient = Ingredient::create($data);
        return response()->json([
            'success' => true,
            'message' => 'Raw ingredient added successfully!',
            'data' => $ingredient
        ], 201);
    }

    public function restockIngredient(Request $request, int $id)
    {
        $request->validate([
            'quantity' => 'required|numeric|min:0.01'
        ]);

        $ingredient = Ingredient::findOrFail($id);
        $ingredient->stock += $request->quantity;
        $ingredient->save();

        return response()->json([
            'success' => true,
            'message' => "Restocked {$request->quantity} {$ingredient->unit} of {$ingredient->name} successfully!",
            'data' => $ingredient
        ]);
    }

    public function getRecipes()
    {
        $recipes = ProductIngredient::with(['product', 'ingredient'])->get();
        return response()->json([
            'success' => true,
            'data' => $recipes
        ]);
    }

    public function storeRecipe(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity_required' => 'required|numeric|min:0.0001'
        ]);

        $recipe = ProductIngredient::updateOrCreate(
            ['product_id' => $data['product_id'], 'ingredient_id' => $data['ingredient_id']],
            ['quantity_required' => $data['quantity_required']]
        );

        return response()->json([
            'success' => true,
            'message' => 'Recipe mapping saved successfully!',
            'data' => $recipe->load(['product', 'ingredient'])
        ]);
    }
}
