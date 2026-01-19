<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\VendorPayment;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $paidStatuses = ['paid', 'processed', 'completed', 'ready_for_pickup', 'shipped', 'delivered'];

        // Orders (Income)
        $ordersQuery = Order::with(['items.product.cost'])
            ->whereIn('status', $paidStatuses)
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate);

        $grossSales = $ordersQuery->sum('total_amount');
        $totalDiscount = $ordersQuery->sum('discount_amount');
        $netSales = $ordersQuery->sum('grand_total');
        $orders = $ordersQuery->get();

        $totalCOGS = 0;
        $incomeTransactions = [];

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $cost = $item->product->cost->cost ?? 0;
                $totalCOGS += $item->quantity * $cost;
            }
            $incomeTransactions[] = [
                'id' => 'ORD-' . $order->id,
                'date' => $order->created_at->toDateTimeString(),
                'type' => 'income',
                'category' => 'Sales',
                'description' => 'Order #' . $order->order_number . ' (' . $order->checkout_name . ')',
                'gross_amount' => $order->total_amount,
                'discount_amount' => $order->discount_amount,
                'amount' => $order->grand_total, // Net amount received
                'status' => $order->status,
            ];
        }

        // Vendor Payments (Expense)
        $paymentsQuery = VendorPayment::with('vendor')
            ->whereDate('payment_date', '>=', $startDate)
            ->whereDate('payment_date', '<=', $endDate);

        $totalVendorPayments = $paymentsQuery->sum('amount');
        $payments = $paymentsQuery->get();

        $expenseTransactions = [];
        foreach ($payments as $payment) {
            $expenseTransactions[] = [
                'id' => 'PAY-' . $payment->id,
                'date' => $payment->payment_date->format('Y-m-d H:i:s'),
                'type' => 'expense',
                'category' => 'Vendor Payment',
                'description' => 'Payment to ' . ($payment->vendor->name ?? 'Unknown Vendor'),
                'amount' => $payment->amount,
                'status' => 'completed',
            ];
        }

        $grossProfit = $netSales - $totalCOGS;
        $netCashFlow = $netSales - $totalVendorPayments;

        $transactions = array_merge($incomeTransactions, $expenseTransactions);

        // Sort by date desc
        usort($transactions, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        return response()->json([
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'summary' => [
                'gross_sales' => $grossSales,
                'total_discount' => $totalDiscount,
                'net_sales' => $netSales,
                'total_cogs' => $totalCOGS,
                'gross_profit' => $grossProfit,
                'total_vendor_payments' => $totalVendorPayments,
                'net_cash_flow' => $netCashFlow
            ],
            'transactions' => $transactions
        ]);
    }
}
