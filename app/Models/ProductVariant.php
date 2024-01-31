<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductVariant extends Model
{
    use HasFactory,SoftDeletes;

    protected $primaryKey = null;

    public $incrementing = false;

    protected $fillable = [
        'product_id',
        'variant_item_id',
        'sku',
        'stock',
        'price',
    ];

    public function product(){
        return $this->belongsTo(Product::class,'product_id','id');
    }

    public function variant_item(){
        return $this->belongsTo(VariantItem::class,'variant_item_id','id');
    }
}
