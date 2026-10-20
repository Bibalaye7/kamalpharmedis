<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');

        $orders = Order::with(['user:id,name,email', 'items'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->whereLoose('reference', $search)
                    ->orWhereLoose('shipping_name', $search)
                    ->orWhereHas('user', fn ($u) => $u->whereLoose('name', $search)
                        ->orWhereLoose('email', $search));
            }))
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 15), 100));

        return response()->json($orders);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json($order->load(['items.product:id,slug,images', 'user:id,name,email,phone']));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(Order::STATUSES)],
            'payment_status' => ['sometimes', 'required', Rule::in(Order::PAYMENT_STATUSES)],
        ]);

        $refused = DB::transaction(function () use ($order, $data) {
            // Commande verrouillée et statut relu : une annulation faite au même moment par le client
            // ou un autre membre de l'équipe ne remet jamais le stock en vente deux fois.
            $locked = Order::whereKey($order->id)->lockForUpdate()->first();
            $newStatus = $data['status'] ?? $locked->status;

            if ($locked->status === 'cancelled' && $newStatus !== 'cancelled') {
                return 'Une commande annulée ne peut pas être réactivée.';
            }

            // Annulation : le stock est remis en vente
            if ($newStatus === 'cancelled' && $locked->status !== 'cancelled') {
                foreach ($locked->items->sortBy('product_id') as $item) {
                    Product::withTrashed()->whereKey($item->product_id)->increment('stock', $item->quantity);
                }
            }

            if ($newStatus === 'delivered' && $locked->status !== 'delivered') {
                $data['delivered_at'] = now();
                $data['payment_status'] ??= 'paid'; // encaissement à la livraison
            }

            $locked->update($data);

            return null;
        }, 3);

        if ($refused) {
            return response()->json(['message' => $refused], 422);
        }

        Cache::tags(['catalog'])->flush();

        return response()->json($order->fresh(['items', 'user:id,name,email']));
    }
}
