<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderEditLog extends Model
{
    /**
     * Indicates if the model should be timestamped.
     * We only use created_at, not updated_at
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'order_id',
        'user_id',
        'action',
        'field_name',
        'old_value',
        'new_value',
        'metadata',
        'created_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Valid action types for order edits
     */
    public const ACTIONS = [
        'update_info' => 'Update Info',
        'add_item' => 'Add Item',
        'remove_item' => 'Remove Item',
        'update_item' => 'Update Item',
        'update_status' => 'Update Status',
        'recalculate_discount' => 'Recalculate Discount',
        'adjustment_resolved' => 'Adjustment Resolved',
    ];

    /**
     * Get the order that this log belongs to.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who made this edit.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create a new log entry for an order edit.
     */
    public static function log(
        Order $order,
        int $userId,
        string $action,
        ?string $fieldName = null,
        mixed $oldValue = null,
        mixed $newValue = null,
        ?array $metadata = null
    ): self {
        return self::create([
            'order_id' => $order->id,
            'user_id' => $userId,
            'action' => $action,
            'field_name' => $fieldName,
            'old_value' => is_array($oldValue) ? json_encode($oldValue) : (string) $oldValue,
            'new_value' => is_array($newValue) ? json_encode($newValue) : (string) $newValue,
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }

    /**
     * Get human-readable description of the change.
     */
    public function getDescriptionAttribute(): string
    {
        $userName = $this->user?->name ?? 'System';

        return match ($this->action) {
            'update_info' => "{$userName} mengubah {$this->field_name} dari \"{$this->old_value}\" menjadi \"{$this->new_value}\"",
            'add_item' => "{$userName} menambahkan item: " . ($this->metadata['product_name'] ?? 'Unknown'),
            'remove_item' => "{$userName} menghapus item: " . ($this->metadata['product_name'] ?? 'Unknown'),
            'update_item' => $this->getUpdateItemDescription($userName),
            'update_status' => "{$userName} mengubah status dari \"{$this->old_value}\" menjadi \"{$this->new_value}\"",
            'recalculate_discount' => "{$userName} melakukan perhitungan ulang diskon",
            'adjustment_resolved' => "{$userName} menyelesaikan penyesuaian harga: " . ($this->metadata['resolution'] ?? ''),
            default => "{$userName} melakukan perubahan pada pesanan",
        };
    }

    /**
     * Get description for update_item action.
     */
    private function getUpdateItemDescription(string $userName): string
    {
        $productName = $this->metadata['product_name'] ?? 'item';

        if ($this->field_name === 'quantity') {
            return "{$userName} mengubah quantity {$productName} dari {$this->old_value} menjadi {$this->new_value}";
        }

        if ($this->field_name === 'recipient_name') {
            return "{$userName} mengubah penerima {$productName} dari \"{$this->old_value}\" menjadi \"{$this->new_value}\"";
        }

        return "{$userName} mengubah {$this->field_name} pada {$productName}";
    }
}
