<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\VendorPayment;
use Illuminate\Http\Request;

class FinancialReportController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/reports/finance",
     *     summary="Get financial report",
     *     tags={"Admin Reports"},
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Successful operation"
     *     )
     * )
     */
    public function index()
    {
        $paidStatuses = ['paid', 'processed', 'completed', 'ready_for_pickup', 'shipped', 'delivered'];

        $grossSales = Order::whereIn('status', $paidStatuses)->sum('total_amount');

        $orders = Order::with(['items.product.cost'])
            ->whereIn('status', $paidStatuses)
            ->get();

        $totalCOGS = 0;
        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $cost = $item->product->cost->cost ?? 0;
                $totalCOGS += $item->quantity * $cost;
            }
        }

        $totalVendorPayments = VendorPayment::sum('amount');

        $grossProfit = $grossSales - $totalCOGS;
        $netCashFlow = $grossSales - $totalVendorPayments;

        return response()->json([
            'gross_sales' => $grossSales,
            'total_cogs' => $totalCOGS,
            'gross_profit' => $grossProfit,
            'total_vendor_payments' => $totalVendorPayments,
            'net_cash_flow' => $netCashFlow
        ]);
    }
}
