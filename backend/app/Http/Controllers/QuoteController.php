<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Demandes de devis des professionnels (cliniques, pharmacies, hôpitaux, cabinets...). */
class QuoteController extends Controller
{
    /** Envoi d'une demande (ouvert à tous ; rattachée au compte si le client est connecté). */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_type' => ['required', Rule::in(QuoteRequest::COMPANY_TYPES)],
            'ninea' => ['nullable', 'string', 'max:40'],
            'contact_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'city' => ['required', 'string', 'max:80'],
            'needed_by' => ['nullable', 'date', 'after_or_equal:today'],
            'message' => ['nullable', 'string', 'max:3000'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.product_name' => ['required_without:items.*.product_id', 'nullable', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100000'],
        ], [], [
            'company_name' => 'nom de l\'établissement',
            'company_type' => 'type d\'établissement',
            'contact_name' => 'nom du contact',
            'city' => 'ville',
            'needed_by' => 'date souhaitée',
            'items' => 'produits',
            'items.*.product_name' => 'nom du produit',
            'items.*.quantity' => 'quantité',
        ]);

        $quote = DB::transaction(function () use ($data) {
            $quote = QuoteRequest::create([
                ...collect($data)->except('items')->all(),
                'reference' => QuoteRequest::generateReference(),
                'user_id' => auth('api')->id(),
                'status' => 'new',
            ]);

            foreach ($data['items'] as $item) {
                // Pour un produit du catalogue, le nom vient toujours de la base (pas du formulaire).
                $name = ! empty($item['product_id'])
                    ? Product::withTrashed()->whereKey($item['product_id'])->value('name')
                    : $item['product_name'];

                $quote->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'product_name' => $name,
                    'quantity' => $item['quantity'],
                ]);
            }

            return $quote;
        });

        return response()->json([
            'message' => "Votre demande de devis {$quote->reference} a bien été envoyée. Notre équipe vous répond sous 24 à 48h ouvrées.",
            'quote' => $quote->load('items'),
        ], 201);
    }

    /** « Mes devis » : demandes rattachées au compte connecté. */
    public function index(Request $request): JsonResponse
    {
        $quotes = $request->user()->quoteRequests()
            ->with('items')
            ->latest('id')
            ->get()
            ->map(fn (QuoteRequest $q) => $q->makeHidden('admin_notes'));

        return response()->json(['data' => $quotes]);
    }
}
