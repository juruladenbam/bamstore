<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
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

    public function show(string $id)
    {
        return response()->json(Order::with(['items.product', 'items.variants'])->findOrFail($id));
    }

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
