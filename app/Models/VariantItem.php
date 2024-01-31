<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VariantItem extends Model
{
    use HasFactory,SoftDeletes;

    protected $guarded = ['id'];

    public function product_variant(){
        return $this->hasMany(ProductVariant::class,'variant_item_id','id');
    }

    public function variant(){
        return $this->belongsTo(Variant::class,'variant_id','id');
    }
}
