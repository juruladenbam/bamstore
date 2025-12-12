<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'checkout_name',
        'phone_number',
        'qobilah',
        'payment_method',
        'status',
        'total_amount',
        'proof_image',
    ];

    protected static function booted()
    {
        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(6));
                // Ensure uniqueness
                while (static::where('order_number', $order->order_number)->exists()) {
                    $order->order_number = 'ORD-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(6));
                }
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'order_number';
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('order_number', $value)->orWhere('id', $value)->firstOrFail();
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
