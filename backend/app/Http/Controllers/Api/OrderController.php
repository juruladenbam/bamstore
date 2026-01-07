<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function show($identifier)
    {
        $order = Order::with(['items.product', 'items.variants'])
            ->where(function ($query) use ($identifier) {
                $query->where('order_number', $identifier)
                      ->orWhere('id', $identifier);
            })
            ->firstOrFail();

        // Format validation or transformation if needed, 
        // similar to OrderHistoryController but for a single order
        
        // Transform items to match expected frontend structure if needed
        $order->items->transform(function ($item) {
            $item->product_name = $item->product ? $item->product->name : 'Unknown Product';
            // Assuming variants relationship exists and works as in OrderHistory
            $item->variant_name = $item->variants->pluck('name')->join(', ');
            $item->price = $item->unit_price_at_order;
            return $item;
        });

        // Fetch global settings to include payment info
        $settings = \App\Models\Setting::all();
        $formattedSettings = [];
        foreach ($settings as $setting) {
            $value = $setting->value;
            if ($setting->type === 'json') {
                $value = json_decode($value, true);
            } elseif ($setting->type === 'boolean') {
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            } elseif ($setting->type === 'integer') {
                $value = (int) $value;
            }
            $formattedSettings[$setting->key] = $value;
        }

        // Attach settings to the order object or response
        $order->settings = $formattedSettings;

        return response()->json($order);
    }
}
