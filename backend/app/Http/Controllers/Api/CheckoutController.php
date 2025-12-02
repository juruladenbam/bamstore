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
            'items.*.recipient_phone' => 'nullable|string|max:20',
            'items.*.recipient_qobilah' => 'nullable|string|max:255',
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

                        // Update Member Data Pool for Payer
            $this->updateMemberPool($validated['phone_number'], $validated['checkout_name'], $validated['qobilah']);

            // Update Member Data Pool for Recipients
            $processedRecipients = [$validated['checkout_name']]; // Track by name to avoid duplicates in this order

            foreach ($validated['items'] as $item) {
                $rName = $item['recipient_name'];
                $rPhone = $item['recipient_phone'] ?? null;
                $rQobilah = $item['recipient_qobilah'] ?? null;

                // If recipient is the payer, we already handled it.
                if ($rName === $validated['checkout_name']) {
                    continue;
                }

                if (in_array($rName, $processedRecipients)) {
                    continue;
                }

                $this->updateMemberPool($rPhone, $rName, $rQobilah);
                $processedRecipients[] = $rName;
            }

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

    private function updateMemberPool($phone, $name, $qobilah)
    {
        $member = null;

        if ($phone) {
            // Case 1: Phone is provided (Checkout User)
            $member = \App\Models\MemberDataPool::where('phone_number', $phone)->first();

            if (!$member) {
                // Phone not found. Check if Name exists without a phone.
                $existingByName = \App\Models\MemberDataPool::where('name', $name)->first();

                if ($existingByName && is_null($existingByName->phone_number)) {
                    // Found a "Name-only" record. Claim it.
                    $member = $existingByName;
                }
                // Else: Name exists but has a DIFFERENT phone, OR Name doesn't exist.
                // In both cases, we create a NEW record for this new Phone.
            }
        } else {
            // Case 2: No Phone provided (Recipient User)
            // Just find by name.
            $member = \App\Models\MemberDataPool::where('name', $name)->first();
        }

        if (!$member) {
            $member = new \App\Models\MemberDataPool();
            $member->name = $name;
        }

        // Update fields
        if ($phone) $member->phone_number = $phone;
        if ($qobilah) $member->qobilah = $qobilah;

        $member->order_count = ($member->order_count ?? 0) + 1;
        $member->save();
    }


}
