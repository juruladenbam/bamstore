<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCost extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $fillable = ['product_id', 'cost'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
