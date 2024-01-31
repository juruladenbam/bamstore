<?php

namespace App\Http\Controllers\Home;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\ProductVariant;

class HomeController extends Controller
{
    public function main()
    {
        $data = ProductVariant::with(
            'product.product_image',
        )->whereIn('variant_item_id',[1,14])->get();
        return view('home.main',compact('data'));
    }
}
