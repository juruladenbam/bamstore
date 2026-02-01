<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class VendorReportController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/reports/recap",
     *     summary="Get vendor recap report",
     *     tags={"Admin Reports"},
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="vendor_id",
     *         in="query",
     *         description="Filter by Vendor ID",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function recap(Request $request)
    {
        $vendorId = $request->input('vendor_id');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = OrderItem::with(['product.vendor', 'variants', 'order'])
            ->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->where('status', '!=', 'cancelled');

                if ($startDate) {
                    $q->whereDate('created_at', '>=', $startDate);
                }

                if ($endDate) {
                    $q->whereDate('created_at', '<=', $endDate);
                }
            });

        if ($vendorId) {
            $query->whereHas('product', function ($q) use ($vendorId) {
                $q->where('vendor_id', $vendorId);
            });
        }

        $items = $query->get();

        // Grouping in PHP
        $grouped = $items->groupBy(function ($item) {
            // Group by Product ID and sorted Variant IDs to distinguish unique combinations
            $variantIds = $item->variants->pluck('id')->sort()->join('-');
            return $item->product_id . '|' . $variantIds;
        });

        $report = $grouped->map(function ($group) {
            $first = $group->first();
            return [
                'vendor_id' => $first->product->vendor_id,
                'vendor_name' => $first->product->vendor->name ?? 'Unknown',
                'product_id' => $first->product_id,
                'product_name' => $first->product->name,
                'variants' => $first->variants->map(function ($v) {
                    return [
                        'type' => $v->type ?? 'General',
                        'name' => $v->name
                    ];
                })->values(),
                'total_quantity' => $group->sum('quantity'),
            ];
        })->values();

        return response()->json($report);
    }
}
