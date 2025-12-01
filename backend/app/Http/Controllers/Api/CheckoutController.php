<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\ProductSku;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'checkout_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'qobilah' => 'required|string|max:255',
            'payment_method' => 'required|in:transfer,cash',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_ids' => 'array', // Can be empty if no variants selected
            'items.*.variant_ids.*' => 'exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.recipient_name' => 'required|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            $orderItemsToCreate = [];

            foreach ($validated['items'] as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                $basePrice = $product->base_price;

                $variants = [];
                $variantsTotalAdjustment = 0;
                $selectedVariantIds = $item['variant_ids'] ?? [];
                sort($selectedVariantIds);

                if (!empty($selectedVariantIds)) {
                    $variants = ProductVariant::whereIn('id', $selectedVariantIds)->get();
                    foreach ($variants as $v) {
                        $variantsTotalAdjustment += $v->price_adjustment;
                    }
                }

                // Check for SKU match
                $sku = ProductSku::where('product_id', $product->id)->get()->first(function ($s) use ($selectedVariantIds) {
                    $skuVariantIds = $s->variant_ids ?? [];
                    sort($skuVariantIds);
                    return $skuVariantIds == $selectedVariantIds;
                });

                $skuCode = null;
                if ($sku) {
                    if ($sku->stock < $item['quantity']) {
                        throw new \Exception("Insufficient stock for product {$product->name} (SKU: {$sku->sku})");
                    }
                    $sku->decrement('stock', $item['quantity']);
                    $skuCode = $sku->sku;

                    // Use SKU price if set, otherwise calculated
                    if ($sku->price > 0) {
                        $unitPrice = $sku->price;
                    } else {
                        $unitPrice = $basePrice + $variantsTotalAdjustment;
                    }
                } else {
                    // Fallback: Check individual variant stock?
                    // For now, just use calculated price and assume infinite stock if no SKU defined
                    // OR check product stock if no variants?
                    $unitPrice = $basePrice + $variantsTotalAdjustment;
                }

                $subtotal = $unitPrice * $item['quantity'];
                $totalAmount += $subtotal;

                $orderItemsToCreate[] = [
                    'data' => [
                        'product_id' => $product->id,
                        'sku' => $skuCode,
                        'recipient_name' => $item['recipient_name'],
                        'unit_price_at_order' => $unitPrice,
                        'quantity' => $item['quantity'],
                    ],
                    'variants' => $variants
                ];
            }

            $order = Order::create([
                'checkout_name' => $validated['checkout_name'],
                'phone_number' => $validated['phone_number'],
                'qobilah' => $validated['qobilah'],
                'payment_method' => $validated['payment_method'],
                'status' => 'new',
                'total_amount' => $totalAmount,
            ]);

            foreach ($orderItemsToCreate as $itemData) {
                $orderItem = $order->items()->create($itemData['data']);

                // Attach variants
                foreach ($itemData['variants'] as $variant) {
                    $orderItem->variants()->attach($variant->id, [
                        'price_at_order' => $variant->price_adjustment
                    ]);
                }
            }

            // Update Member Data Pool
            $member = \App\Models\MemberDataPool::firstOrNew(
                ['phone_number' => $validated['phone_number']],
                [
                    'name' => $validated['checkout_name'],
                    'qobilah' => $validated['qobilah']
                ]
            );

            $member->name = $validated['checkout_name'];
            $member->qobilah = $validated['qobilah'];
            $member->order_count += 1;
            $member->save();

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order_id' => $order->id,
                'total_amount' => $totalAmount
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Order creation failed', 'error' => $e->getMessage()], 500);
        }
    }
}
