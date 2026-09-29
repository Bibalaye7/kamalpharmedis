<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Paiement en ligne (Wave, Orange Money, Free Money, carte) via l'agrégateur PayDunya.
 * Documentation : https://developers.paydunya.com
 */
class PaymentController extends Controller
{
    /** Crée une facture PayDunya pour la commande et renvoie l'URL de paiement. */
    public function initiate(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Cette commande est déjà payée.'], 422);
        }

        if (! $this->configured()) {
            return response()->json([
                'message' => "Le paiement en ligne n'est pas encore configuré. Choisissez « Paiement à la livraison » pour continuer.",
            ], 503);
        }

        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        $payload = [
            'invoice' => [
                'total_amount' => $order->total,
                'description' => "Commande {$order->reference} — KamalPharMédis",
            ],
            'store' => [
                'name' => 'KamalPharMédis',
            ],
            'actions' => [
                'cancel_url' => "{$frontendUrl}/compte/commandes/{$order->id}?paiement=annule",
                'return_url' => "{$frontendUrl}/compte/commandes/{$order->id}?paiement=retour",
                'callback_url' => rtrim(config('app.url'), '/').'/api/payments/paydunya/callback',
            ],
            'custom_data' => [
                'order_id' => $order->id,
                'order_reference' => $order->reference,
            ],
        ];

        $response = Http::withHeaders($this->headers())
            ->post($this->baseUrl().'/checkout-invoice/create', $payload);

        $data = $response->json();

        if (! $response->successful() || ($data['response_code'] ?? null) !== '00') {
            Log::warning('PayDunya : échec de création de facture', ['order' => $order->id, 'response' => $data]);

            return response()->json(['message' => "Impossible de démarrer le paiement pour le moment. Réessayez ou choisissez « Paiement à la livraison »."], 502);
        }

        $order->update([
            'payment_token' => $data['token'],
            'payment_url' => $data['response_text'] ?? "https://paydunya.com/checkout/invoice/{$data['token']}",
        ]);

        return response()->json(['payment_url' => $order->payment_url]);
    }

    /** Le client revient de PayDunya : on vérifie le statut réel auprès de PayDunya (jamais depuis l'URL). */
    public function status(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        if (! $order->payment_token) {
            return response()->json(['payment_status' => $order->payment_status]);
        }

        $this->confirmAndUpdate($order);

        return response()->json(['payment_status' => $order->fresh()->payment_status]);
    }

    /** Notification serveur-à-serveur de PayDunya (IPN) : source de vérité pour marquer une commande payée. */
    public function callback(Request $request): JsonResponse
    {
        $token = $request->input('data.invoice.token')
            ?? $request->input('token')
            ?? $request->input('data.token');

        $order = $token ? Order::where('payment_token', $token)->first() : null;

        if (! $order) {
            Log::warning('PayDunya callback : commande introuvable', ['payload' => $request->all()]);

            return response()->json(['message' => 'ignoré'], 200);
        }

        $this->confirmAndUpdate($order);

        return response()->json(['message' => 'ok']);
    }

    /** Interroge PayDunya (jamais le contenu du webhook/retour) pour confirmer un paiement, puis met à jour la commande. */
    private function confirmAndUpdate(Order $order): void
    {
        if ($order->payment_status === 'paid' || ! $order->payment_token) {
            return;
        }

        $response = Http::withHeaders($this->headers())
            ->get($this->baseUrl()."/checkout-invoice/confirm/{$order->payment_token}");

        $data = $response->json();

        if (($data['status'] ?? null) === 'completed') {
            $order->update(['payment_status' => 'paid']);
        }
    }

    /** Moyens de paiement proposés et coordonnées du paiement manuel (public : affiché au moment de commander). */
    public function config(): JsonResponse
    {
        return response()->json([
            'online' => Order::onlinePaymentEnabled(),
            'methods' => Order::availablePaymentMethods(),
            'manual' => config('services.manual_payment'),
        ]);
    }

    private function configured(): bool
    {
        return Order::onlinePaymentEnabled();
    }

    private function baseUrl(): string
    {
        return config('services.paydunya.mode') === 'live'
            ? 'https://app.paydunya.com/api/v1'
            : 'https://app.paydunya.com/sandbox-api/v1';
    }

    private function headers(): array
    {
        return [
            'Content-Type' => 'application/json',
            'PAYDUNYA-MASTER-KEY' => config('services.paydunya.master_key'),
            'PAYDUNYA-PRIVATE-KEY' => config('services.paydunya.private_key'),
            'PAYDUNYA-PUBLIC-KEY' => config('services.paydunya.public_key'),
            'PAYDUNYA-TOKEN' => config('services.paydunya.token'),
        ];
    }
}
