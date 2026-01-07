<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderHistoryController extends Controller
{
    /**
     * @OA\Post(
     *     path="/history",
     *     summary="Get order history by phone number",
     *     tags={"Orders"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"phone_number"},
     *             @OA\Property(property="phone_number", type="string", example="08123456789")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     )
     * )
     */
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
                // $order->order_number is already set from DB, but fallback to ID if missing
                if (empty($order->order_number)) { 
                    $order->order_number = (string) $order->id;
                }

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
