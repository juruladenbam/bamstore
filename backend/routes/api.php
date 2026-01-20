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
use App\Http\Controllers\PermissionDebugController;

// Debug Permissions Route (protected by secret key in .env)
Route::get('/debug-permissions', [PermissionDebugController::class, 'index'])
    ->withoutMiddleware(['auth:sanctum']);

Route::get('/user', function (Request $request) {
    $user = $request->user();
    $user->load('roles');
    // Add all permissions (direct + via roles)
    $user->all_permissions = $user->getAllPermissions()->pluck('name');
    return $user;
})->middleware('auth:sanctum');

// Storefront Public Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/order-activity/export', [\App\Http\Controllers\Api\OrderActivityController::class, 'export']);
Route::get('/order-activity', [\App\Http\Controllers\Api\OrderActivityController::class, 'index']);
Route::post('/history', [\App\Http\Controllers\Api\OrderHistoryController::class, 'index']);
Route::get('/orders/{order}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
Route::get('/members/search', [\App\Http\Controllers\Api\MemberDataController::class, 'search']);
Route::post('/checkout', [CheckoutController::class, 'store']);
Route::post('/coupons/check', [\App\Http\Controllers\Api\CouponController::class, 'check']);
Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);

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
    Route::put('/orders/{id}', [AdminOrderController::class, 'update']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);
    Route::delete('/orders/{id}', [AdminOrderController::class, 'destroy']);

    // Order Item Management
    Route::post('/orders/{id}/items', [AdminOrderController::class, 'addItem']);
    Route::put('/orders/{id}/items/{itemId}', [AdminOrderController::class, 'updateItem']);
    Route::delete('/orders/{id}/items/{itemId}', [AdminOrderController::class, 'removeItem']);

    // Order Edit History & Adjustments
    Route::get('/orders/{id}/history', [AdminOrderController::class, 'getHistory']);
    Route::post('/orders/{id}/resolve-adjustment', [AdminOrderController::class, 'resolveAdjustment']);
    Route::post('/orders/check-stock', [AdminOrderController::class, 'checkStock']);

    Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);

    Route::get('/reports/recap', [\App\Http\Controllers\Api\Admin\VendorReportController::class, 'recap']);
    Route::get('/reports/finance', [\App\Http\Controllers\Api\Admin\FinancialReportController::class, 'index']);

    Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'update']);

    // User Management
    Route::middleware(['permission:manage users'])->group(function () {
        Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class);
        Route::get('/roles', [\App\Http\Controllers\Api\Admin\RoleController::class, 'index']);
    });

    // Profile Settings
    Route::put('/profile', [\App\Http\Controllers\Api\Admin\ProfileController::class, 'update']);
    Route::put('/profile/password', [\App\Http\Controllers\Api\Admin\ProfileController::class, 'updatePassword']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
});
