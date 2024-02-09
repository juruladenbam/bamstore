<?php

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\Home\HomeController;
use App\Http\Controllers\Produk\ProdukController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Route::get('/clear', function() {
    Artisan::call('cache:clear');
    Artisan::call('config:clear');
    Artisan::call('config:cache');
    Artisan::call('view:clear');
    Artisan::call('route:clear');
    return "Cleared!";
});
// URL::forceScheme('https');
Route::group(['middleware' => 'guest'], function(){
    Route::get('/', [HomeController::class, 'main'])->name('home');

    Route::get('/produk', [ProdukController::class, 'main'])->name('produk');
    Route::get('/produk/{slug}', [ProdukController::class, 'detail'])->name('produk-detail');
});


