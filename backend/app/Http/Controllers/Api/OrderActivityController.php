<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderActivityController extends Controller
{
    /**
     * @OA\Get(
     *     path="/order-activity",
     *     summary="Get recent order activity",
     *     tags={"Orders"},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search by recipient name",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function index(Request $request)
    {
        $query = OrderItem::with(['product', 'variants', 'order'])
            ->whereHas('order', function($q) {
                $q->where('status', '!=', 'cancelled');
            });

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('recipient_name', 'like', "%{$search}%");
        }

        $items = $query->latest()->limit(50)->get();

        $data = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'recipient_name' => $item->recipient_name,
                'product_name' => $item->product->name,
                'variants' => $item->variants->pluck('name')->join(', '),
                'quantity' => $item->quantity,
                'date' => $item->created_at->diffForHumans(),
                'status' => $item->order->status
            ];
        });

        return response()->json($data);
    }
}
