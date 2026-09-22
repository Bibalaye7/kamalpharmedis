<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        if (Order::exists()) {
            return; // déjà peuplé
        }

        $products = Product::pluck('id', 'sku');

        // [client, statut, paiement, méthode, jours écoulés, [[sku, quantité], ...]]
        $orders = [
            ['aminata@email.com', 'delivered', 'paid', 'mobile_money', 95, [['KPM-TENS-001', 1], ['KPM-MASK-008', 2]]],
            ['aminata@email.com', 'delivered', 'paid', 'cash_on_delivery', 48, [['KPM-VITA-003', 2], ['KPM-PHYT-006', 1]]],
            ['moussa@email.com', 'shipped', 'unpaid', 'cash_on_delivery', 6, [['KPM-GLUC-002', 1]]],
            ['aminata@email.com', 'processing', 'paid', 'card', 3, [['KPM-URGE-004', 1], ['KPM-THER-005', 1]]],
            ['fatou@email.com', 'pending', 'unpaid', 'mobile_money', 1, [['KPM-STET-007', 1]]],
            ['aminata@email.com', 'cancelled', 'unpaid', 'cash_on_delivery', 20, [['KPM-MASK-008', 5]]],
        ];

        foreach ($orders as $n => [$email, $status, $payment, $method, $daysAgo, $lines]) {
            $user = User::where('email', $email)->first();
            $address = $user->addresses()->orderByDesc('is_default')->first();

            $items = [];
            $subtotal = 0;

            foreach ($lines as [$sku, $qty]) {
                $product = Product::find($products[$sku]);
                $total = $product->price * $qty;
                $subtotal += $total;

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_price' => $product->price,
                    'quantity' => $qty,
                    'total' => $total,
                ];
            }

            $createdAt = now()->subDays($daysAgo)->setTime(10 + $n, 15);
            $shipping = Order::shippingFeeFor($subtotal);

            $order = Order::create([
                'reference' => sprintf('KPM-%s-%04d', $createdAt->format('ymd'), 1001 + $n),
                'user_id' => $user->id,
                'status' => $status,
                'payment_method' => $method,
                'payment_status' => $payment,
                'subtotal' => $subtotal,
                'shipping_fee' => $shipping,
                'total' => $subtotal + $shipping,
                'shipping_name' => $address->full_name,
                'shipping_phone' => $address->phone,
                'shipping_address' => trim($address->line1.' '.$address->line2),
                'shipping_city' => $address->city,
                'notes' => $n === 3 ? 'Merci de livrer après 17h.' : null,
                'delivered_at' => $status === 'delivered' ? $createdAt->copy()->addDays(2) : null,
            ]);

            $order->items()->createMany($items);
            $order->forceFill(['created_at' => $createdAt, 'updated_at' => $createdAt])->saveQuietly();
        }

        // Favoris d'Aminata
        $aminata = User::where('email', 'aminata@email.com')->first();
        $aminata->wishlist()->syncWithoutDetaching([$products['KPM-GLUC-002'], $products['KPM-PHYT-006'], $products['KPM-STET-007']]);
    }
}
