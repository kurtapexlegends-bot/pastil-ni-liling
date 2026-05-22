<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth Routes (Rate Limited against Brute Force & Credential Stuffing)
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

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
        Route::post('/franchise/commissary-orders', [\App\Http\Controllers\CommissaryController::class, 'store']);
        Route::get('/franchise/commissary-orders', [\App\Http\Controllers\CommissaryController::class, 'index']);
    });

    // Order Placement (Authenticated)
    Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);

    // Admin Routes
    Route::middleware('role:Admin|HQ operations')->prefix('admin')->group(function () {
        Route::get('/applications', [\App\Http\Controllers\Admin\FranchiseApplicationController::class, 'index']);
        Route::patch('/applications/{id}', [\App\Http\Controllers\Admin\FranchiseApplicationController::class, 'updateStatus']);
        
        // Admin Order Management
        Route::get('/orders', [\App\Http\Controllers\Admin\AdminOrderController::class, 'index']);
        Route::patch('/orders/{id}', [\App\Http\Controllers\Admin\AdminOrderController::class, 'updateStatus']);

        // Admin B2B Commissary Restocks
        Route::get('/commissary-orders', [\App\Http\Controllers\CommissaryController::class, 'adminIndex']);
        Route::patch('/commissary-orders/{id}', [\App\Http\Controllers\CommissaryController::class, 'adminUpdateStatus']);

        // Product Catalog Management
        Route::get('/products', [\App\Http\Controllers\Admin\ProductController::class, 'index']);
        Route::post('/products', [\App\Http\Controllers\Admin\ProductController::class, 'store']);
        Route::put('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'update']);
        Route::delete('/products/{id}', [\App\Http\Controllers\Admin\ProductController::class, 'destroy']);

        // Franchise Branch Management
        Route::post('/hubs', [\App\Http\Controllers\Admin\HubController::class, 'store']);
        Route::put('/hubs/{id}', [\App\Http\Controllers\Admin\HubController::class, 'update']);
        Route::delete('/hubs/{id}', [\App\Http\Controllers\Admin\HubController::class, 'destroy']);
        Route::get('/franchisees', [\App\Http\Controllers\Admin\AdminFranchiseeController::class, 'index']);

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
        Route::get('/hubs', [\App\Http\Controllers\Admin\HubController::class, 'index']);
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
