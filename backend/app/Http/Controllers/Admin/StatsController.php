<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $valid = fn ($q) => $q->where('status', '!=', 'cancelled');

        $revenue = (int) Order::where('status', '!=', 'cancelled')->sum('total');
        $revenueMonth = (int) Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('total');

        // Chiffre d'affaires des 6 derniers mois (agrégé en PHP : compatible tout SGBD)
        $since = now()->subMonths(5)->startOfMonth();
        $byMonth = Order::where('status', '!=', 'cancelled')
            ->where('created_at', '>=', $since)
            ->get(['total', 'created_at'])
            ->groupBy(fn ($o) => $o->created_at->format('Y-m'));

        $monthly = collect(range(0, 5))->map(function ($i) use ($since, $byMonth) {
            $month = $since->copy()->addMonths($i);
            $orders = $byMonth->get($month->format('Y-m'), collect());

            return [
                'month' => $month->format('Y-m'),
                'label' => $month->locale('fr')->translatedFormat('M'),
                'revenue' => (int) $orders->sum('total'),
                'orders' => $orders->count(),
            ];
        })->values();

        $topProducts = OrderItem::select('product_id', 'product_name', DB::raw('SUM(quantity) as sold'), DB::raw('SUM(total) as revenue'))
            ->whereHas('order', $valid)
            ->groupBy('product_id', 'product_name')
            ->orderByDesc('sold')
            ->take(5)
            ->get();

        return response()->json([
            'totals' => [
                'revenue' => $revenue,
                'revenue_month' => $revenueMonth,
                'orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'products' => Product::count(),
                'low_stock' => Product::where('stock', '<=', 10)->count(),
                'clients' => User::whereHas('role', fn ($q) => $q->where('name', Role::CLIENT))->count(),
            ],
            'orders_by_status' => Order::select('status', DB::raw('COUNT(*) as count'))->groupBy('status')->pluck('count', 'status'),
            'monthly' => $monthly,
            'top_products' => $topProducts,
            'recent_orders' => Order::with('user:id,name,email')->latest('id')->take(6)->get(),
            'low_stock_products' => Product::with('category:id,name,slug')->where('stock', '<=', 10)->orderBy('stock')->take(5)->get(),
        ]);
    }
}
