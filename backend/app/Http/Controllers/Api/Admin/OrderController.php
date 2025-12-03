<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/orders",
     *     summary="Get list of orders (Admin)",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(type="string", enum={"new", "paid", "processed", "ready_pickup", "completed", "cancelled"})
     *     ),
     *     @OA\Parameter(
     *         name="qobilah",
     *         in="query",
     *         description="Filter by qobilah",
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
        $query = Order::with(['items.product', 'items.variants']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('qobilah')) {
            $query->where('qobilah', $request->qobilah);
        }

        return response()->json($query->latest()->get());
    }

    /**
     * @OA\Get(
     *     path="/admin/orders/{id}",
     *     summary="Get order details (Admin)",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function show(string $id)
    {
        return response()->json(Order::with(['items.product', 'items.variants'])->findOrFail($id));
    }

    /**
     * @OA\Put(
     *     path="/admin/orders/{id}/status",
     *     summary="Update order status",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"new", "paid", "processed", "ready_pickup", "completed", "cancelled"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Order status updated"
     *     )
     * )
     */
    public function updateStatus(Request $request, string $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:new,paid,processed,ready_pickup,completed,cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json($order);
    }
}
