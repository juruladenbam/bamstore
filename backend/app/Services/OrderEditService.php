<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderEditLog;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\ProductVariant;
use App\Models\User;
use App\Exceptions\CouponException;
use Illuminate\Support\Facades\DB;

class OrderEditService
{
    protected CouponService $couponService;

    public function __construct(CouponService $couponService)
    {
        $this->couponService = $couponService;
    }

    /**
     * Update order basic info (checkout_name, phone_number, qobilah, payment_method)
     */
    public function updateInfo(Order $order, array $data, User $editor): Order
    {
        $changes = [];
        $loggableFields = ['checkout_name', 'phone_number', 'qobilah', 'payment_method', 'status'];

        foreach ($loggableFields as $field) {
            if (isset($data[$field]) && $order->{$field} !== $data[$field]) {
                $changes[$field] = [
                    'old' => $order->{$field},
                    'new' => $data[$field],
                ];
            }
        }

        if (empty($changes)) {
            return $order;
        }

        DB::transaction(function () use ($order, $data, $editor, $changes, $loggableFields) {
            // Handle stock restoration if status changed to cancelled
            if (isset($changes['status']) && $changes['status']['new'] === 'cancelled' && $changes['status']['old'] !== 'cancelled') {
                $this->restoreAllItemsStock($order, $editor);
            }

            // Update order
            $updateData = array_intersect_key($data, array_flip($loggableFields));
            $updateData['last_edited_at'] = now();
            $updateData['last_edited_by'] = $editor->id;
            $order->update($updateData);

            // Log each change
            foreach ($changes as $field => $change) {
                $action = $field === 'status' ? 'update_status' : 'update_info';
                OrderEditLog::log($order, $editor->id, $action, $field, $change['old'], $change['new']);
            }
        });

        return $order->fresh();
    }

    /**
     * Add new item to order
     */
    public function addItem(Order $order, array $itemData, User $editor): OrderItem
    {
        return DB::transaction(function () use ($order, $itemData, $editor) {
            $product = Product::findOrFail($itemData['product_id']);
            $variantIds = $itemData['variant_ids'] ?? [];
            sort($variantIds);

            // Calculate price
            $basePrice = $product->base_price;
            $variantAdjustment = 0;
            $variants = [];

            if (!empty($variantIds)) {
                $variants = ProductVariant::whereIn('id', $variantIds)->get();
                $variantAdjustment = $variants->sum('price_adjustment');
            }

            // Find and validate SKU
            $sku = null;
            $skuCode = null;
            $unitPrice = $basePrice + $variantAdjustment;

            $productSkus = ProductSku::where('product_id', $product->id)->lockForUpdate()->get();
            $sku = $productSkus->first(function ($s) use ($variantIds) {
                $skuVariantIds = $s->variant_ids ?? [];
                sort($skuVariantIds);
                return $skuVariantIds == $variantIds;
            });

            if ($sku) {
                if ($sku->stock < $itemData['quantity']) {
                    throw new \Exception("Stock tidak cukup untuk {$product->name}. Tersedia: {$sku->stock}");
                }
                $sku->decrement('stock', $itemData['quantity']);
                $skuCode = $sku->sku;

                if ($sku->price > 0) {
                    $unitPrice = $sku->price;
                }
            }

            // Create order item
            $orderItem = $order->items()->create([
                'product_id' => $product->id,
                'sku' => $skuCode,
                'recipient_name' => $itemData['recipient_name'],
                'unit_price_at_order' => $unitPrice,
                'quantity' => $itemData['quantity'],
            ]);

            // Attach variants
            foreach ($variants as $variant) {
                $orderItem->variants()->attach($variant->id, [
                    'price_at_order' => $variant->price_adjustment,
                ]);
            }

            // Log the addition
            OrderEditLog::log($order, $editor->id, 'add_item', null, null, null, [
                'order_item_id' => $orderItem->id,
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $itemData['quantity'],
                'unit_price' => $unitPrice,
                'recipient_name' => $itemData['recipient_name'],
            ]);

            // Recalculate totals
            $this->recalculateTotals($order, $editor, false);

            // Update edit tracking
            $order->update([
                'last_edited_at' => now(),
                'last_edited_by' => $editor->id,
            ]);

            return $orderItem->fresh(['product', 'variants']);
        });
    }

    /**
     * Remove item from order
     */
    public function removeItem(Order $order, OrderItem $item, User $editor): void
    {
        DB::transaction(function () use ($order, $item, $editor) {
            // Prevent removing the last item
            if ($order->items()->count() <= 1) {
                throw new \Exception("Pesanan harus memiliki minimal 1 item.");
            }

            // Restore stock
            $stockRestored = $this->restoreItemStock($item);

            // Log the removal
            OrderEditLog::log($order, $editor->id, 'remove_item', null, null, null, [
                'order_item_id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product?->name ?? 'Unknown',
                'quantity' => $item->quantity,
                'stock_returned' => $stockRestored,
            ]);

            // Delete item and its variants
            $item->variants()->detach();
            $item->delete();

            // Recalculate totals
            $this->recalculateTotals($order, $editor, false);

            // Update edit tracking
            $order->update([
                'last_edited_at' => now(),
                'last_edited_by' => $editor->id,
            ]);
        });
    }

    /**
     * Update item (quantity, recipient_name)
     */
    public function updateItem(Order $order, OrderItem $item, array $data, User $editor): OrderItem
    {
        return DB::transaction(function () use ($order, $item, $data, $editor) {
            $changes = [];

            // Handle quantity change
            if (isset($data['quantity']) && $data['quantity'] != $item->quantity) {
                $oldQty = $item->quantity;
                $newQty = $data['quantity'];
                $delta = $newQty - $oldQty;

                // Find SKU for stock management
                $variantIds = $item->variants->pluck('id')->sort()->values()->toArray();
                $sku = ProductSku::where('product_id', $item->product_id)
                    ->lockForUpdate()
                    ->get()
                    ->first(function ($s) use ($variantIds) {
                        $skuVariantIds = $s->variant_ids ?? [];
                        sort($skuVariantIds);
                        return $skuVariantIds == $variantIds;
                    });

                if ($sku) {
                    if ($delta > 0) {
                        // Increasing quantity - need more stock
                        if ($sku->stock < $delta) {
                            throw new \Exception("Stock tidak cukup. Tersedia: {$sku->stock}");
                        }
                        $sku->decrement('stock', $delta);
                    } else {
                        // Decreasing quantity - return stock
                        $sku->increment('stock', abs($delta));
                    }
                }

                $item->quantity = $newQty;
                $changes['quantity'] = [
                    'old' => $oldQty,
                    'new' => $newQty,
                    'stock_adjustment' => -$delta, // negative = stock reduced, positive = stock returned
                ];
            }

            // Handle recipient_name change
            if (isset($data['recipient_name']) && $data['recipient_name'] !== $item->recipient_name) {
                $changes['recipient_name'] = [
                    'old' => $item->recipient_name,
                    'new' => $data['recipient_name'],
                ];
                $item->recipient_name = $data['recipient_name'];
            }

            if (empty($changes)) {
                return $item;
            }

            $item->save();

            // Log changes
            foreach ($changes as $field => $change) {
                OrderEditLog::log($order, $editor->id, 'update_item', $field, $change['old'], $change['new'], [
                    'order_item_id' => $item->id,
                    'product_name' => $item->product?->name ?? 'Unknown',
                    'stock_adjustment' => $change['stock_adjustment'] ?? null,
                ]);
            }

            // Recalculate totals if quantity changed
            if (isset($changes['quantity'])) {
                $this->recalculateTotals($order, $editor, false);
            }

            // Update edit tracking
            $order->update([
                'last_edited_at' => now(),
                'last_edited_by' => $editor->id,
            ]);

            return $item->fresh(['product', 'variants']);
        });
    }

    /**
     * Recalculate order totals (subtotal, discount, grand_total)
     */
    public function recalculateTotals(Order $order, User $editor, bool $logChange = true): Order
    {
        return DB::transaction(function () use ($order, $editor, $logChange) {
            $order->load('items');
            
            $oldTotalAmount = (float) $order->total_amount;
            $oldDiscountAmount = (float) $order->discount_amount;
            $oldGrandTotal = (float) $order->grand_total;

            // Calculate new total from items
            $newTotalAmount = $order->items->sum(function ($item) {
                return $item->unit_price_at_order * $item->quantity;
            });

            // Recalculate discount if coupon exists
            $newDiscountAmount = 0;
            $couponWarning = null;

            if ($order->coupon_id) {
                try {
                    $coupon = $order->coupon;
                    if ($coupon) {
                        // Check if coupon is still valid for new total
                        if ($coupon->min_purchase && $newTotalAmount < $coupon->min_purchase) {
                            // Total below minimum - remove coupon
                            $couponWarning = "Kupon dihapus karena total di bawah minimum pembelian.";
                            $order->coupon_id = null;
                            $order->coupon_code = null;
                        } elseif (!$coupon->is_active) {
                            // Coupon no longer active
                            $couponWarning = "Kupon dihapus karena sudah tidak aktif.";
                            $order->coupon_id = null;
                            $order->coupon_code = null;
                        } else {
                            // Recalculate discount
                            $newDiscountAmount = $this->couponService->calculate($coupon, $newTotalAmount);
                        }
                    }
                } catch (\Exception $e) {
                    $couponWarning = "Kupon dihapus: " . $e->getMessage();
                    $order->coupon_id = null;
                    $order->coupon_code = null;
                }
            }

            $newGrandTotal = $newTotalAmount - $newDiscountAmount;

            // Update order
            $order->total_amount = $newTotalAmount;
            $order->discount_amount = $newDiscountAmount;
            $order->grand_total = $newGrandTotal;

            // Handle price adjustment for completed orders
            if ($order->status === 'completed' && $oldGrandTotal != $newGrandTotal) {
                $adjustment = $newGrandTotal - $oldGrandTotal;
                $order->price_adjustment_amount = abs($adjustment);
                $order->price_adjustment_status = $adjustment > 0 ? 'underpaid' : 'overpaid';
            }

            $order->save();

            // Log if there were significant changes
            if ($logChange && ($oldDiscountAmount != $newDiscountAmount || $oldTotalAmount != $newTotalAmount)) {
                OrderEditLog::log($order, $editor->id, 'recalculate_discount', 'discount_amount', $oldDiscountAmount, $newDiscountAmount, [
                    'old_total' => $oldTotalAmount,
                    'new_total' => $newTotalAmount,
                    'old_grand_total' => $oldGrandTotal,
                    'new_grand_total' => $newGrandTotal,
                    'coupon_code' => $order->coupon_code,
                    'coupon_warning' => $couponWarning,
                ]);
            }

            return $order->fresh();
        });
    }

    /**
     * Resolve price adjustment
     */
    public function resolveAdjustment(Order $order, string $resolution, User $editor, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $resolution, $editor, $reason) {
            $amount = $order->price_adjustment_amount;
            $status = $order->price_adjustment_status;

            // Reset adjustment status
            $order->update([
                'price_adjustment_status' => 'none',
                'price_adjustment_amount' => 0,
                'last_edited_at' => now(),
                'last_edited_by' => $editor->id,
            ]);

            // Log the resolution
            OrderEditLog::log($order, $editor->id, 'adjustment_resolved', null, $status, 'none', [
                'resolution' => $resolution,
                'amount' => $amount,
                'reason' => $reason,
            ]);

            return $order->fresh();
        });
    }

    /**
     * Restore stock for a single item
     */
    private function restoreItemStock(OrderItem $item): bool
    {
        $variantIds = $item->variants->pluck('id')->sort()->values()->toArray();
        
        $sku = ProductSku::where('product_id', $item->product_id)
            ->get()
            ->first(function ($s) use ($variantIds) {
                $skuVariantIds = $s->variant_ids ?? [];
                sort($skuVariantIds);
                return $skuVariantIds == $variantIds;
            });

        if ($sku) {
            $sku->increment('stock', $item->quantity);
            return true;
        }

        return false;
    }

    /**
     * Restore stock for all items in an order (used when cancelling)
     */
    private function restoreAllItemsStock(Order $order, User $editor): void
    {
        $order->load('items.variants');
        
        foreach ($order->items as $item) {
            $restored = $this->restoreItemStock($item);
            
            if ($restored) {
                OrderEditLog::log($order, $editor->id, 'update_item', 'stock_restored', null, null, [
                    'order_item_id' => $item->id,
                    'product_name' => $item->product?->name ?? 'Unknown',
                    'quantity_returned' => $item->quantity,
                    'reason' => 'order_cancelled',
                ]);
            }
        }
    }

    /**
     * Check stock availability for a product/variant combination
     */
    public function checkStockAvailability(int $productId, array $variantIds, int $requiredQuantity, ?int $excludeItemId = null): array
    {
        sort($variantIds);
        
        $sku = ProductSku::where('product_id', $productId)
            ->get()
            ->first(function ($s) use ($variantIds) {
                $skuVariantIds = $s->variant_ids ?? [];
                sort($skuVariantIds);
                return $skuVariantIds == $variantIds;
            });

        if (!$sku) {
            return [
                'available' => true,
                'stock' => null,
                'message' => 'No SKU tracking for this product',
            ];
        }

        // If updating existing item, add back its current quantity to available
        $currentQty = 0;
        if ($excludeItemId) {
            $existingItem = OrderItem::find($excludeItemId);
            if ($existingItem) {
                $currentQty = $existingItem->quantity;
            }
        }

        $availableStock = $sku->stock + $currentQty;

        return [
            'available' => $availableStock >= $requiredQuantity,
            'stock' => $availableStock,
            'message' => $availableStock >= $requiredQuantity 
                ? 'Stock tersedia' 
                : "Stock tidak cukup. Tersedia: {$availableStock}",
        ];
    }
}
