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

        $items = $query->latest()->get();

        $data = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'recipient_name' => $item->recipient_name,
                'product_name' => $item->product->name,
                'variants' => $item->variants->pluck('name')->join(', '),
                'quantity' => $item->quantity,
                'date' => $item->created_at->diffForHumans(),
                'status' => $item->order->status,
                'qobilah' => $item->order->qobilah,
            ];
        });

        return response()->json($data);
    }

    /**
     * @OA\Get(
     *     path="/order-activity/export",
     *     summary="Get order activity data for sharing",
     *     tags={"Orders"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation",
     *         @OA\JsonContent(
     *             @OA\Property(property="items", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="by_qobilah", type="object"),
     *             @OA\Property(property="by_variant", type="object"),
     *             @OA\Property(property="summary", type="object")
     *         )
     *     )
     * )
     */
    public function export(Request $request)
    {
        // Define the qobilah order
        $qobilahOrder = [
            "QOBILAH MARIYAH", "QOBILAH BUSYRI", "QOBILAH MUZAMMAH", "QOBILAH SULHAN",
            "QOBILAH SHOLIHATUN", "QOBILAH NURSIYAM", "QOBILAH NI'MAH", "QOBILAH ABD MAJID",
            "QOBILAH SAIDAH", "QOBILAH THOHIR AL ALY", "NYAI NIHAYA (NGAGLIK)"
        ];

        $items = OrderItem::with(['product', 'variants', 'order'])
            ->whereHas('order', function($q) {
                $q->where('status', '!=', 'cancelled');
            })
            ->latest()
            ->get();

        // Map items to structured data
        $mappedItems = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'recipient_name' => $item->recipient_name,
                'product_name' => $item->product->name,
                'variants' => $item->variants->pluck('name')->join(', '),
                'sku' => $item->product->name . ($item->variants->count() > 0 ? ' - ' . $item->variants->pluck('name')->join(', ') : ''),
                'quantity' => $item->quantity,
                'date' => $item->created_at->format('Y-m-d H:i'),
                'status' => $item->order->status,
                'qobilah' => $item->order->qobilah ?? 'Tidak Ada Qobilah',
            ];
        });

        // Group by Qobilah
        $groupedByQobilah = $mappedItems->groupBy('qobilah')->map(function ($groupItems, $qobilahName) {
            // Group by recipient name and status to handle multiple orders from same person
            $summarizedItems = $groupItems->groupBy(function($item) {
                return $item['recipient_name'] . '|' . $item['status'];
            })->map(function ($items, $key) {
                return [
                    'recipient_name' => $items->first()['recipient_name'],
                    'total_quantity' => $items->sum('quantity'),
                    'status' => $items->first()['status'],
                ];
            })->values();

            return [
                'name' => $qobilahName,
                'total_orders' => $groupItems->count(),
                'total_paid' => $groupItems->where('status', 'paid')->count(),
                'total_unpaid' => $groupItems->where('status', '!=', 'paid')->count(),
                'items' => $summarizedItems,
            ];
        });

        // Build by_qobilah with all predefined qobilahs (including empty ones)
        $byQobilah = collect($qobilahOrder)->map(function ($qobilahName) use ($groupedByQobilah) {
            if ($groupedByQobilah->has($qobilahName)) {
                return $groupedByQobilah->get($qobilahName);
            }
            // Return empty entry for qobilah with no orders
            return [
                'name' => $qobilahName,
                'total_orders' => 0,
                'total_paid' => 0,
                'total_unpaid' => 0,
                'items' => [],
            ];
        });
        
        // Add any qobilah not in the predefined order at the end
        $unknownQobilahs = $groupedByQobilah->filter(fn($group) => !in_array($group['name'], $qobilahOrder))->values();
        $byQobilah = $byQobilah->concat($unknownQobilahs);

        // Group by Variant/SKU
        $byVariant = $mappedItems->groupBy('sku')->map(function ($groupItems, $skuName) {
            return [
                'sku' => $skuName,
                'total_quantity' => $groupItems->sum('quantity'),
                'total_orders' => $groupItems->count(),
                'total_paid' => $groupItems->where('status', 'paid')->count(),
                'total_unpaid' => $groupItems->where('status', '!=', 'paid')->count(),
                'items' => $groupItems->map(function ($item) {
                    return [
                        'recipient_name' => $item['recipient_name'],
                        'quantity' => $item['quantity'],
                        'status' => $item['status'],
                    ];
                })->values(),
            ];
        })->values();

        // Calculate summary
        $summary = [
            'total_orders' => $mappedItems->count(),
            'total_paid' => $mappedItems->where('status', 'paid')->count(),
            'total_unpaid' => $mappedItems->where('status', '!=', 'paid')->count(),
            'total_quantity' => $mappedItems->sum('quantity'),
            'export_date' => now()->format('d F Y'),
        ];

        return response()->json([
            'items' => $mappedItems,
            'by_qobilah' => $byQobilah,
            'by_variant' => $byVariant,
            'summary' => $summary,
        ]);
    }
}
