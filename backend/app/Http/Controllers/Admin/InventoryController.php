<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RestockIngredientRequest;
use App\Http\Requests\Admin\StoreIngredientRequest;
use App\Http\Requests\Admin\StoreInventoryBatchRequest;
use App\Http\Requests\Admin\StoreRecipeRequest;
use App\Models\Ingredient;
use App\Models\InventoryBatch;
use App\Models\ProductIngredient;
use App\Services\InventoryBatchService;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    public function __construct(
        protected InventoryBatchService $batchService
    ) {}

    public function getBatches(): JsonResponse
    {
        $batches = InventoryBatch::with(['product', 'hub'])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $batches,
        ]);
    }

    public function storeBatch(StoreInventoryBatchRequest $request): JsonResponse
    {
        try {
            $batch = $this->batchService->createBatch($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Inventory batch logged and HQ ingredients depleted successfully!',
                'data' => $batch,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function triggerMarkdown(): JsonResponse
    {
        $count = $this->batchService->triggerCloseToExpiryDiscounts();

        return response()->json([
            'success' => true,
            'message' => "Successfully scanned and marked {$count} batches near expiration for 30% markdown!",
            'data' => ['discounted_count' => $count],
        ]);
    }

    public function getIngredients(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Ingredient::latest()->get(),
        ]);
    }

    public function storeIngredient(StoreIngredientRequest $request): JsonResponse
    {
        $ingredient = Ingredient::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Raw ingredient added successfully!',
            'data' => $ingredient,
        ], 201);
    }

    public function restockIngredient(RestockIngredientRequest $request, int $id): JsonResponse
    {
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->stock += $request->validated('quantity');
        $ingredient->save();

        return response()->json([
            'success' => true,
            'message' => "Restocked {$request->validated('quantity')} {$ingredient->unit} of {$ingredient->name} successfully!",
            'data' => $ingredient,
        ]);
    }

    public function getRecipes(): JsonResponse
    {
        $recipes = ProductIngredient::with(['product', 'ingredient'])->get();

        return response()->json([
            'success' => true,
            'data' => $recipes,
        ]);
    }

    public function storeRecipe(StoreRecipeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $recipe = ProductIngredient::updateOrCreate(
            ['product_id' => $data['product_id'], 'ingredient_id' => $data['ingredient_id']],
            ['quantity_required' => $data['quantity_required']]
        );

        return response()->json([
            'success' => true,
            'message' => 'Recipe mapping saved successfully!',
            'data' => $recipe->load(['product', 'ingredient']),
        ]);
    }
}
