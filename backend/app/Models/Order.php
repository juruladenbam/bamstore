<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * Valid order statuses
     */
    public const STATUSES = [
        'new' => 'Baru',
        'paid' => 'Dibayar',
        'processed' => 'Diproses',
        'ready_pickup' => 'Siap Diambil',
        'completed' => 'Selesai',
        'cancelled' => 'Dibatalkan',
    ];

    /**
     * Price adjustment statuses
     */
    public const PRICE_ADJUSTMENT_STATUSES = [
        'none' => 'Tidak Ada',
        'overpaid' => 'Kelebihan Bayar',
        'underpaid' => 'Kurang Bayar',
    ];

    protected $fillable = [
        'order_number',
        'checkout_name',
        'phone_number',
        'qobilah',
        'payment_method',
        'status',
        'total_amount',
        'proof_image',
        'coupon_id',
        'coupon_code',
        'discount_amount',
        'grand_total',
        // Edit tracking fields
        'price_adjustment_status',
        'price_adjustment_amount',
        'last_edited_at',
        'last_edited_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'price_adjustment_amount' => 'decimal:2',
        'last_edited_at' => 'datetime',
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

            // Set grand_total if not set
            if ($order->grand_total === null) {
                $order->grand_total = $order->total_amount - $order->discount_amount;
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

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Get the edit logs for this order.
     */
    public function editLogs(): HasMany
    {
        return $this->hasMany(OrderEditLog::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the user who last edited this order.
     */
    public function lastEditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_edited_by');
    }

    /**
     * Check if order has pending price adjustment.
     */
    public function hasPendingAdjustment(): bool
    {
        return $this->price_adjustment_status !== 'none';
    }

    /**
     * Check if order is editable (can be modified).
     */
    public function isEditable(): bool
    {
        // All statuses are editable, but we track adjustments for completed orders
        return true;
    }

    /**
     * Get status label in Indonesian.
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }
}

