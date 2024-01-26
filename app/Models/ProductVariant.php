<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;

    protected $primaryKey = null;

    public $incrementing = false;

    protected $fillable = [
        'product_id',
        'variant_item_id',
        'sku',
        'stock',
        'price',
    ];
}
