<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Overview Stats
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total_amount');
        $totalOrders = Order::count();
        $totalProducts = Product::count();
        // Count unique customers based on phone_number
        $totalCustomers = Order::distinct('phone_number')->count('phone_number');

        // 2. Recent Orders
        $recentOrders = Order::with('items')
            ->latest()
            ->take(5)
            ->get();

        // 3. Sales Chart (Last 30 days)
        $salesData = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as total')
            )
            ->where('status', '!=', 'cancelled')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // 4. Order Status Distribution
        $orderStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrders,
                'total_products' => $totalProducts,
                'total_customers' => $totalCustomers,
            ],
            'recent_orders' => $recentOrders,
            'sales_chart' => $salesData,
            'order_status' => $orderStatus,
        ]);
    }
}
