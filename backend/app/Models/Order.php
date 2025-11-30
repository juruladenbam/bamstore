<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'checkout_name',
        'phone_number',
        'qobilah',
        'payment_method',
        'status',
        'total_amount',
        'proof_image',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
