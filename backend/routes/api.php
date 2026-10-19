<?php

use App\Http\Controllers\Admin\AdminFranchiseeController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Admin\WebsiteSettingController;
use App\Http\Controllers\Analytics\AnalyticsController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Compliance\ComplianceController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\Franchise\CommissaryController;
use App\Http\Controllers\Franchise\FranchiseController;
use App\Http\Controllers\FranchiseApplicationController;
use App\Http\Controllers\HubController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\Payroll\PayrollController;
use App\Http\Controllers\ProductController;
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
    Route::get('/orders', [OrderController::class, 'index']);

    // Franchisee Branch Inventory and B2C Orders
    Route::middleware('role:Franchisee|Branch Cashier')->group(function () {
        Route::get('/franchise/inventory', [FranchiseController::class, 'getInventory']);
        Route::get('/franchise/orders', [FranchiseController::class, 'getHubOrders']);
        Route::patch('/franchise/orders/{id}', [FranchiseController::class, 'updateHubOrderStatus']);
        Route::post('/pos/sync', [OrderController::class, 'syncPOSOrders']);
        Route::post('/franchise/commissary-orders', [CommissaryController::class, 'store']);
        Route::get('/franchise/commissary-orders', [CommissaryController::class, 'index']);
    });

    // Order Placement (Authenticated)
    Route::post('/orders', [OrderController::class, 'store']);

    // Admin Routes
    Route::middleware('role:Admin|HQ operations')->prefix('admin')->group(function () {
        Route::get('/applications', [App\Http\Controllers\Admin\FranchiseApplicationController::class, 'index']);
        Route::patch('/applications/{id}', [App\Http\Controllers\Admin\FranchiseApplicationController::class, 'updateStatus']);

        // Admin Order Management
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::patch('/orders/{id}', [AdminOrderController::class, 'updateStatus']);

        // Admin B2B Commissary Restocks
        Route::get('/commissary-orders', [CommissaryController::class, 'adminIndex']);
        Route::patch('/commissary-orders/{id}', [CommissaryController::class, 'adminUpdateStatus']);

        // Product Catalog Management
        Route::get('/products', [App\Http\Controllers\Admin\ProductController::class, 'index']);
        Route::post('/products/upload-image', [App\Http\Controllers\Admin\ProductController::class, 'uploadImage']);
        Route::post('/products', [App\Http\Controllers\Admin\ProductController::class, 'store']);
        Route::put('/products/{id}', [App\Http\Controllers\Admin\ProductController::class, 'update']);
        Route::delete('/products/{id}', [App\Http\Controllers\Admin\ProductController::class, 'destroy']);

        // Franchise Branch Management
        Route::post('/hubs', [App\Http\Controllers\Admin\HubController::class, 'store']);
        Route::put('/hubs/{id}', [App\Http\Controllers\Admin\HubController::class, 'update']);
        Route::delete('/hubs/{id}', [App\Http\Controllers\Admin\HubController::class, 'destroy']);
        Route::get('/franchisees', [AdminFranchiseeController::class, 'index']);

        // Supply Chain & Batch Integrity Management
        Route::get('/inventory/batches', [InventoryController::class, 'getBatches']);
        Route::post('/inventory/batches', [InventoryController::class, 'storeBatch']);
        Route::post('/inventory/batches/markdown', [InventoryController::class, 'triggerMarkdown']);
        Route::get('/inventory/ingredients', [InventoryController::class, 'getIngredients']);
        Route::post('/inventory/ingredients', [InventoryController::class, 'storeIngredient']);
        Route::post('/inventory/ingredients/{id}/restock', [InventoryController::class, 'restockIngredient']);
        Route::get('/inventory/recipes', [InventoryController::class, 'getRecipes']);
        Route::post('/inventory/recipes', [InventoryController::class, 'storeRecipe']);

        // Phase 4: Employee Personnel Controls (Multi-Tier RBAC)
        Route::post('/employees', [EmployeeController::class, 'store']);
        Route::put('/employees/{id}', [EmployeeController::class, 'update']);
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);

        // Website Settings Content Management
        Route::put('/website-settings', [WebsiteSettingController::class, 'update']);
    });

    // Routes shared by Admin, HQ operations, and Franchisee
    Route::middleware('role:Admin|HQ operations|Franchisee')->prefix('admin')->group(function () {
        Route::get('/employees', [EmployeeController::class, 'index']);
        Route::get('/hubs', [App\Http\Controllers\Admin\HubController::class, 'index']);
    });

    // Phase 4: Digital Compliance & QC Audits
    Route::get('/compliance/audits', [ComplianceController::class, 'index']);
    Route::post('/compliance/audits', [ComplianceController::class, 'store']);
    Route::patch('/compliance/audits/{id}', [ComplianceController::class, 'updateStatus']);
    Route::get('/compliance/anomalies', [ComplianceController::class, 'getAnomalies']);
    Route::patch('/compliance/anomalies/{id}/resolve', [ComplianceController::class, 'resolveAnomaly']);

    // Phase 4: Cashier Shift Sessions and Direct Payout Commission Ledger
    Route::post('/payroll/shifts/clock-in', [PayrollController::class, 'clockIn']);
    Route::post('/payroll/shifts/clock-out', [PayrollController::class, 'clockOut']);
    Route::post('/payroll/shifts/break-start', [PayrollController::class, 'startBreak']);
    Route::post('/payroll/shifts/break-end', [PayrollController::class, 'endBreak']);
    Route::get('/payroll/shifts', [PayrollController::class, 'getShifts']);
    Route::get('/payroll/payouts/calculate', [PayrollController::class, 'calculatePayout']);
    Route::post('/payroll/payouts', [PayrollController::class, 'storePayout']);
    Route::get('/payroll/payouts', [PayrollController::class, 'getPayouts']);

    // Branch Operational Expenses
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
    Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);

    // Phase 5: Business Intelligence & Predictive Analytics Engine
    Route::get('/analytics/summary', [AnalyticsController::class, 'getSummary']);
});

// Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

// Franchise Routes
Route::post('/franchise/apply', [FranchiseApplicationController::class, 'store']);

// Hub Public Routes
Route::get('/hubs', [HubController::class, 'index']);

// Website Settings Public Route
Route::get('/website-settings', [WebsiteSettingController::class, 'index']);
