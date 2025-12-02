<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderHistoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'phone_number' => 'required|string',
        ]);

        $phoneNumber = $request->input('phone_number');

        // Normalize phone number if needed (e.g. remove leading 0, +62, etc)
        // For now, we assume exact match or simple like query

        $orders = Order::with(['items.product', 'items.variants'])
            ->where('phone_number', 'like', "%{$phoneNumber}%")
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                $order->order_number = 'ORD-' . str_pad($order->id, 5, '0', STR_PAD_LEFT);

                $order->items->transform(function ($item) {
                    $item->product_name = $item->product ? $item->product->name : 'Unknown Product';
                    $item->variant_name = $item->variants->pluck('name')->join(', ');
                    $item->price = $item->unit_price_at_order;
                    return $item;
                });

                return $order;
            });

        return response()->json($orders);
    }
}
