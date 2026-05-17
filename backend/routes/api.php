<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User Order History
    Route::get('/orders', [\App\Http\Controllers\OrderController::class, 'index']);

    // Admin Routes
    Route::middleware('role:Admin')->prefix('admin')->group(function () {
        Route::get('/applications', [\App\Http\Controllers\AdminController::class, 'getFranchiseApplications']);
        Route::patch('/applications/{id}', [\App\Http\Controllers\AdminController::class, 'updateApplicationStatus']);
        
        // Admin Order Management
        Route::get('/orders', [\App\Http\Controllers\AdminController::class, 'getOrders']);
        Route::patch('/orders/{id}', [\App\Http\Controllers\AdminController::class, 'updateOrderStatus']);
    });
});

// Product Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

// Order Routes (Allowing guest for now, but will use user_id if authenticated)
Route::post('/orders', [\App\Http\Controllers\OrderController::class, 'store']);

// Franchise Routes
Route::post('/franchise/apply', [\App\Http\Controllers\FranchiseApplicationController::class, 'store']);
