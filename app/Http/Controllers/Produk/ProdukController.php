<?php

namespace App\Http\Controllers\Produk;

use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use App\Http\Controllers\Controller;
use App\Models\VariantItem;

class ProdukController extends Controller
{
    public function main()
    {
        $data = ProductVariant::with(
            'product.product_image',
        )->whereIn('variant_item_id',[1,14])->get();
        return view('produk.main',compact('data'));
    }

    public function detail($slug, Request $request)
    {
        $product = Product::with('product_images')->where('slug',$slug)->first();
        $data['product'] = $product;

        if($request->ajax()){
            $data['variants'] = VariantItem::whereIn('id',$request->variant_item_id)->get();
            return response()->json($data);
        }else{
            $data['variants'] = Variant::with([
                'variant_item'=>function($q) use ($product){
                    $q->whereHas('product_variant', function($q) use ($product){
                        $q->where('product_id',$product->id);
                    });
                }
            ])->get();
            return view('produk.detail',$data)->render();
        }

    }
}
