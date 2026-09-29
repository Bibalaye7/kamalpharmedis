<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/** Commandes du client connecté (les staffs voient tout via /admin/orders). */
class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with('items')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 10), 50));

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorizeView($request, $order);

        return response()->json($order->load(['items.product:id,slug,images', 'user:id,name,email,phone']));
    }

    /**
     * Crée une commande à partir du panier du client (ou d'une liste d'articles).
     * Le stock est vérifié et décrémenté dans une transaction.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'address_id' => ['nullable', 'integer', Rule::exists('addresses', 'id')->where('user_id', $user->id)],
            'shipping_name' => ['required_without:address_id', 'nullable', 'string', 'max:255'],
            'shipping_phone' => ['required_without:address_id', 'nullable', 'string', 'max:30'],
            'shipping_address' => ['required_without:address_id', 'nullable', 'string', 'max:255'],
            'shipping_city' => ['required_without:address_id', 'nullable', 'string', 'max:80'],
            'payment_method' => ['required', Rule::in(Order::availablePaymentMethods())],
            'notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['nullable', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required_with:items', 'integer'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1', 'max:99'],
        ]);

        if (! empty($data['address_id'])) {
            $address = Address::findOrFail($data['address_id']);
            $shipping = [
                'shipping_name' => $address->full_name,
                'shipping_phone' => $address->phone,
                'shipping_address' => trim($address->line1.' '.$address->line2),
                'shipping_city' => $address->city,
            ];
        } else {
            $shipping = collect($data)->only(['shipping_name', 'shipping_phone', 'shipping_address', 'shipping_city'])->all();
        }

        $fromCart = empty($data['items']);
        $lines = $fromCart
            ? $user->cartItems()->get(['product_id', 'quantity'])->map(fn ($i) => $i->only(['product_id', 'quantity']))->all()
            : $data['items'];

        if (empty($lines)) {
            throw ValidationException::withMessages(['items' => 'Votre panier est vide.']);
        }

        $order = DB::transaction(function () use ($user, $data, $shipping, $lines, $fromCart) {
            // Verrouille les produits pour éviter la survente
            $products = Product::active()
                ->whereIn('id', collect($lines)->pluck('product_id'))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotal = 0;
            $rows = [];

            foreach ($lines as $line) {
                $product = $products->get($line['product_id']);

                if (! $product) {
                    throw ValidationException::withMessages(['items' => 'Un produit de votre panier n\'est plus disponible.']);
                }

                if ($product->stock < $line['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Stock insuffisant pour « {$product->name} » (reste {$product->stock}).",
                    ]);
                }

                $lineTotal = $product->price * $line['quantity'];
                $subtotal += $lineTotal;

                $rows[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $line['quantity'],
                    'total' => $lineTotal,
                ];

                $product->decrement('stock', $line['quantity']);
            }

            $shippingFee = Order::shippingFeeFor($subtotal);

            $order = Order::create($shipping + [
                'reference' => Order::generateReference(),
                'user_id' => $user->id,
                'status' => 'pending',
                'payment_method' => $data['payment_method'],
                'payment_status' => 'unpaid',
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'total' => $subtotal + $shippingFee,
                'notes' => $data['notes'] ?? null,
            ]);

            $order->items()->createMany($rows);

            if ($fromCart) {
                $user->cartItems()->delete();
            }

            return $order;
        });

        Cache::tags(['catalog'])->flush(); // le stock a changé

        return response()->json($order->load('items'), 201);
    }

    /** Le client peut annuler tant que la commande n'est pas expédiée. */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        if (! in_array($order->status, ['pending', 'confirmed'], true)) {
            return response()->json(['message' => 'Cette commande ne peut plus être annulée.'], 422);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                Product::withTrashed()->whereKey($item->product_id)->increment('stock', $item->quantity);
            }

            $order->update(['status' => 'cancelled']);
        });

        Cache::tags(['catalog'])->flush();

        return response()->json($order->fresh('items'));
    }

    /**
     * Paiement manuel Wave / Orange Money : le client déclare l'identifiant de sa transaction.
     * La commande reste « non payée » jusqu'à vérification par l'équipe.
     */
    public function declarePayment(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 404);

        if ($order->payment_method !== 'mobile_money' || $order->payment_status === 'paid' || $order->status === 'cancelled') {
            return response()->json(['message' => 'Aucun paiement à déclarer pour cette commande.'], 422);
        }

        $data = $request->validate(
            ['payment_reference' => ['required', 'string', 'min:4', 'max:60', 'regex:/^[A-Za-z0-9 .\-_#\/]+$/']],
            [],
            ['payment_reference' => 'identifiant de transaction'],
        );

        $order->update([
            'payment_reference' => trim($data['payment_reference']),
            'payment_declared_at' => now(),
        ]);

        return response()->json($order->fresh('items.product:id,slug'));
    }

    private function authorizeView(Request $request, Order $order): void
    {
        $user = $request->user();

        abort_unless($order->user_id === $user->id || $user->isStaff(), 404);
    }
}
