<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'sku',
        'recipient_name',
        'unit_price_at_order',
        'quantity',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variants()
    {
        return $this->belongsToMany(ProductVariant::class, 'order_item_variants')
                    ->withPivot('price_at_order')
                    ->withTimestamps();
    }
}
