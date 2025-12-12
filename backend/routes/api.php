<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\VendorController as AdminVendorController;
use App\Http\Controllers\Api\Admin\VendorPaymentController as AdminVendorPaymentController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Storefront Public Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/order-activity', [\App\Http\Controllers\Api\OrderActivityController::class, 'index']);
Route::post('/history', [\App\Http\Controllers\Api\OrderHistoryController::class, 'index']);
Route::get('/members/search', [\App\Http\Controllers\Api\MemberDataController::class, 'search']);
Route::post('/checkout', [CheckoutController::class, 'store']);

// Admin Auth
Route::post('/admin/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

// Admin Routes
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);

    Route::apiResource('products', AdminProductController::class);
    Route::apiResource('categories', AdminCategoryController::class);
    Route::apiResource('vendors', AdminVendorController::class);
    Route::apiResource('vendor-payments', AdminVendorPaymentController::class)->only(['index', 'store', 'destroy']);

    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

    Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);

    Route::get('/reports/recap', [\App\Http\Controllers\Api\Admin\VendorReportController::class, 'recap']);
    Route::get('/reports/finance', [\App\Http\Controllers\Api\Admin\FinancialReportController::class, 'index']);
});
