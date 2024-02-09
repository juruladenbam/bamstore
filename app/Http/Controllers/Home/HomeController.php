<?php

namespace App\Http\Controllers\Home;

use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class HomeController extends Controller
{
    public function main(Request $request)
    {
        return DB::table($request->table)->first();
        if(!session()->has('guest')){
            $guestSession = session()->get('guest');
            $guest_id = Str::random(10);

            $guestSession[$guest_id] = [
                'guest_id' => $guest_id
            ];
            session()->put('guest', $guestSession);
        }

        $data = ProductVariant::with(
            'product.product_image',
        )->whereIn('variant_item_id',[1,14])->get();
        return view('home.main',compact('data'));
    }
}
