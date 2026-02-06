<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderEditService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    protected OrderEditService $orderEditService;

    public function __construct(OrderEditService $orderEditService)
    {
        $this->orderEditService = $orderEditService;
    }

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
     *     @OA\Parameter(
     *         name="payment_method",
     *         in="query",
     *         description="Filter by payment method",
     *         required=false,
     *         @OA\Schema(type="string", enum={"cash", "transfer"})
     *     ),
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Filter orders from this date (Y-m-d format)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="Filter orders until this date (Y-m-d format)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
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

        if ($request->has('payment_method') && !empty($request->payment_method)) {
            $query->where('payment_method', $request->payment_method);
        }

        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('created_at', '<=', $request->end_date);
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
     *         description="Order ID or Order Number",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function show($id)
    {
        $order = Order::with(['items.product', 'items.variants', 'coupon', 'lastEditor'])
            ->where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        return response()->json($order);
    }

    /**
     * @OA\Put(
     *     path="/admin/orders/{id}",
     *     summary="Update order info",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID or Order Number",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="checkout_name", type="string"),
     *             @OA\Property(property="phone_number", type="string"),
     *             @OA\Property(property="qobilah", type="string"),
     *             @OA\Property(property="payment_method", type="string", enum={"transfer", "cash"}),
     *             @OA\Property(property="status", type="string", enum={"new", "paid", "processed", "ready_pickup", "completed", "cancelled"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Order updated"
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'checkout_name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|string|max:20',
            'qobilah' => 'sometimes|string|max:255',
            'payment_method' => 'sometimes|in:transfer,cash',
            'status' => 'sometimes|in:new,paid,processed,ready_pickup,completed,cancelled',
        ]);

        try {
            $updatedOrder = $this->orderEditService->updateInfo($order, $validated, $request->user());

            return response()->json([
                'message' => 'Pesanan berhasil diperbarui',
                'order' => $updatedOrder->load(['items.product', 'items.variants']),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
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
     *         description="Order ID or Order Number",
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
    public function updateStatus(Request $request, $id)
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:new,paid,processed,ready_pickup,completed,cancelled',
        ]);

        try {
            $updatedOrder = $this->orderEditService->updateInfo($order, $validated, $request->user());

            return response()->json($updatedOrder);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/{id}/items",
     *     summary="Add item to order",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID or Order Number",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id", "quantity", "recipient_name"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="variant_ids", type="array", @OA\Items(type="integer")),
     *             @OA\Property(property="quantity", type="integer"),
     *             @OA\Property(property="recipient_name", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Item added"
     *     )
     * )
     */
    public function addItem(Request $request, $id)
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_ids' => 'array',
            'variant_ids.*' => 'exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'recipient_name' => 'required|string|max:255',
        ]);

        try {
            $item = $this->orderEditService->addItem($order, $validated, $request->user());

            return response()->json([
                'message' => 'Item berhasil ditambahkan',
                'item' => $item,
                'order' => $order->fresh(['items.product', 'items.variants']),
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Put(
     *     path="/admin/orders/{id}/items/{itemId}",
     *     summary="Update order item",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID or Order Number",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="itemId",
     *         in="path",
     *         required=true,
     *         description="Order Item ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="quantity", type="integer"),
     *             @OA\Property(property="recipient_name", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Item updated"
     *     )
     * )
     */
    public function updateItem(Request $request, $id, $itemId)
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $item = OrderItem::where('id', $itemId)
            ->where('order_id', $order->id)
            ->firstOrFail();

        $validated = $request->validate([
            'quantity' => 'sometimes|integer|min:1',
            'recipient_name' => 'sometimes|string|max:255',
        ]);

        try {
            $updatedItem = $this->orderEditService->updateItem($order, $item, $validated, $request->user());

            return response()->json([
                'message' => 'Item berhasil diperbarui',
                'item' => $updatedItem,
                'order' => $order->fresh(['items.product', 'items.variants']),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Delete(
     *     path="/admin/orders/{id}/items/{itemId}",
     *     summary="Remove item from order",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID or Order Number",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="itemId",
     *         in="path",
     *         required=true,
     *         description="Order Item ID",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Item removed"
     *     )
     * )
     */
    public function removeItem(Request $request, $id, $itemId)
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $item = OrderItem::where('id', $itemId)
            ->where('order_id', $order->id)
            ->firstOrFail();

        try {
            $this->orderEditService->removeItem($order, $item, $request->user());

            return response()->json([
                'message' => 'Item berhasil dihapus',
                'order' => $order->fresh(['items.product', 'items.variants']),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Get(
     *     path="/admin/orders/{id}/history",
     *     summary="Get order edit history",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID or Order Number",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Order edit history"
     *     )
     * )
     */
    public function getHistory($id)
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $logs = $order->editLogs()
            ->with('user:id,name')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'field_name' => $log->field_name,
                    'old_value' => $log->old_value,
                    'new_value' => $log->new_value,
                    'metadata' => $log->metadata,
                    'description' => $log->description,
                    'user' => $log->user,
                    'created_at' => $log->created_at->toIso8601String(),
                ];
            });

        return response()->json(['logs' => $logs]);
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/{id}/resolve-adjustment",
     *     summary="Resolve price adjustment",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID or Order Number",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"resolution"},
     *             @OA\Property(property="resolution", type="string", enum={"paid", "refunded", "ignored"}),
     *             @OA\Property(property="reason", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Adjustment resolved"
     *     )
     * )
     */
    public function resolveAdjustment(Request $request, $id)
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'resolution' => 'required|in:paid,refunded,ignored',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($order->price_adjustment_status === 'none') {
            return response()->json(['message' => 'Tidak ada penyesuaian harga yang perlu diselesaikan'], 422);
        }

        try {
            $updatedOrder = $this->orderEditService->resolveAdjustment(
                $order,
                $validated['resolution'],
                $request->user(),
                $validated['reason'] ?? null
            );

            return response()->json([
                'message' => 'Penyesuaian harga berhasil diselesaikan',
                'order' => $updatedOrder->load(['items.product', 'items.variants']),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/check-stock",
     *     summary="Check stock availability",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"product_id", "quantity"},
     *             @OA\Property(property="product_id", type="integer"),
     *             @OA\Property(property="variant_ids", type="array", @OA\Items(type="integer")),
     *             @OA\Property(property="quantity", type="integer"),
     *             @OA\Property(property="exclude_item_id", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Stock availability result"
     *     )
     * )
     */
    public function checkStock(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_ids' => 'array',
            'variant_ids.*' => 'exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
            'exclude_item_id' => 'nullable|integer|exists:order_items,id',
        ]);

        $result = $this->orderEditService->checkStockAvailability(
            $validated['product_id'],
            $validated['variant_ids'] ?? [],
            $validated['quantity'],
            $validated['exclude_item_id'] ?? null
        );

        return response()->json($result);
    }

    /**
     * @OA\Delete(
     *     path="/admin/orders/{id}",
     *     summary="Delete order",
     *     tags={"Admin Orders"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="Order ID or Order Number",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Order deleted"
     *     )
     * )
     */
    public function destroy($id)
    {
        $order = Order::where('id', $id)
            ->orWhere('order_number', $id)
            ->firstOrFail();

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }
}

