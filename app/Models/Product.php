<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory,SoftDeletes;

    protected $guarded = ['id'];

    public function product_images(){
        return $this->hasMany(ProductImage::class,'product_id','id');
    }
    public function product_image(){
        return $this->hasOne(ProductImage::class,'product_id','id');
    }

    public function product_variant(){
        return $this->hasMany(ProductVariant::class,'product_id','id');
    }

    public function order_detail(){
        return $this->hasMany(OrderDetail::class,'product_id','id');
    }
}
