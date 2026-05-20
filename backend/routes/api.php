<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User Order History
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index']);

    // Franchisee Branch Inventory and B2C Orders
    Route::middleware('role:Franchisee|Branch Cashier')->group(function () {
        Route::get('/franchise/inventory', [\App\Http\Controllers\FranchiseController::class, 'getInventory']);
        Route::get('/franchise/orders', [\App\Http\Controllers\FranchiseController::class, 'getHubOrders']);
        Route::patch('/franchise/orders/{id}', [\App\Http\Controllers\FranchiseController::class, 'updateHubOrderStatus']);
        Route::post('/pos/sync', [\App\Http\Controllers\OrderController::class, 'syncPOSOrders']);
    });

    // Order Placement (Authenticated)
    Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);

    // Admin Routes
    Route::middleware('role:Admin')->prefix('admin')->group(function () {
        Route::get('/applications', [\App\Http\Controllers\AdminController::class, 'getFranchiseApplications']);
        Route::patch('/applications/{id}', [\App\Http\Controllers\AdminController::class, 'updateApplicationStatus']);
        
        // Admin Order Management
        Route::get('/orders', [\App\Http\Controllers\AdminController::class, 'getOrders']);
        Route::patch('/orders/{id}', [\App\Http\Controllers\AdminController::class, 'updateOrderStatus']);

        // Product Catalog Management
        Route::get('/products', [\App\Http\Controllers\AdminController::class, 'getProducts']);
        Route::post('/products', [\App\Http\Controllers\AdminController::class, 'storeProduct']);
        Route::put('/products/{id}', [\App\Http\Controllers\AdminController::class, 'updateProduct']);
        Route::delete('/products/{id}', [\App\Http\Controllers\AdminController::class, 'destroyProduct']);

        // Franchise Branch Management
        Route::post('/hubs', [\App\Http\Controllers\AdminController::class, 'storeHub']);
        Route::put('/hubs/{id}', [\App\Http\Controllers\AdminController::class, 'updateHub']);
        Route::delete('/hubs/{id}', [\App\Http\Controllers\AdminController::class, 'destroyHub']);
        Route::get('/franchisees', [\App\Http\Controllers\AdminController::class, 'getFranchisees']);

        // Supply Chain & Batch Integrity Management
        Route::get('/inventory/batches', [\App\Http\Controllers\InventoryController::class, 'getBatches']);
        Route::post('/inventory/batches', [\App\Http\Controllers\InventoryController::class, 'storeBatch']);
        Route::post('/inventory/batches/markdown', [\App\Http\Controllers\InventoryController::class, 'triggerMarkdown']);
        Route::get('/inventory/ingredients', [\App\Http\Controllers\InventoryController::class, 'getIngredients']);
        Route::post('/inventory/ingredients', [\App\Http\Controllers\InventoryController::class, 'storeIngredient']);
        Route::post('/inventory/ingredients/{id}/restock', [\App\Http\Controllers\InventoryController::class, 'restockIngredient']);
        Route::get('/inventory/recipes', [\App\Http\Controllers\InventoryController::class, 'getRecipes']);
        Route::post('/inventory/recipes', [\App\Http\Controllers\InventoryController::class, 'storeRecipe']);

        // Phase 4: Employee Personnel Controls (Multi-Tier RBAC)
        Route::post('/employees', [\App\Http\Controllers\EmployeeController::class, 'store']);
        Route::put('/employees/{id}', [\App\Http\Controllers\EmployeeController::class, 'update']);
        Route::delete('/employees/{id}', [\App\Http\Controllers\EmployeeController::class, 'destroy']);
    });

    // Routes shared by Admin, HQ operations, and Franchisee
    Route::middleware('role:Admin|HQ operations|Franchisee')->prefix('admin')->group(function () {
        Route::get('/employees', [\App\Http\Controllers\EmployeeController::class, 'index']);
        Route::get('/hubs', [\App\Http\Controllers\AdminController::class, 'getHubs']);
    });

    // Phase 4: Digital Compliance & QC Audits
    Route::get('/compliance/audits', [\App\Http\Controllers\ComplianceController::class, 'index']);
    Route::post('/compliance/audits', [\App\Http\Controllers\ComplianceController::class, 'store']);
    Route::patch('/compliance/audits/{id}', [\App\Http\Controllers\ComplianceController::class, 'updateStatus']);
    Route::get('/compliance/anomalies', [\App\Http\Controllers\ComplianceController::class, 'getAnomalies']);
    Route::patch('/compliance/anomalies/{id}/resolve', [\App\Http\Controllers\ComplianceController::class, 'resolveAnomaly']);

    // Phase 4: Cashier Shift Sessions and Direct Payout Commission Ledger
    Route::post('/payroll/shifts/clock-in', [\App\Http\Controllers\PayrollController::class, 'clockIn']);
    Route::post('/payroll/shifts/clock-out', [\App\Http\Controllers\PayrollController::class, 'clockOut']);
    Route::get('/payroll/shifts', [\App\Http\Controllers\PayrollController::class, 'getShifts']);
    Route::get('/payroll/payouts/calculate', [\App\Http\Controllers\PayrollController::class, 'calculatePayout']);
    Route::post('/payroll/payouts', [\App\Http\Controllers\PayrollController::class, 'storePayout']);
    Route::get('/payroll/payouts', [\App\Http\Controllers\PayrollController::class, 'getPayouts']);

    // Branch Operational Expenses
    Route::get('/expenses', [\App\Http\Controllers\ExpenseController::class, 'index']);
    Route::post('/expenses', [\App\Http\Controllers\ExpenseController::class, 'store']);
    Route::delete('/expenses/{id}', [\App\Http\Controllers\ExpenseController::class, 'destroy']);

    // Phase 5: Business Intelligence & Predictive Analytics Engine
    Route::get('/analytics/summary', [\App\Http\Controllers\AnalyticsController::class, 'getSummary']);
});

// Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

// Franchise Routes
Route::post('/franchise/apply', [\App\Http\Controllers\FranchiseApplicationController::class, 'store']);

// Hub Public Routes
Route::get('/hubs', [\App\Http\Controllers\HubController::class, 'index']);
