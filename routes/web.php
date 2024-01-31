<?php

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Route;
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

// URL::forceScheme('https');

Route::get('/', [HomeController::class, 'main'])->name('home');

Route::get('/produk', [ProdukController::class, 'main'])->name('produk');
Route::get('/produk/{slug}', [ProdukController::class, 'detail'])->name('produk-detail');


