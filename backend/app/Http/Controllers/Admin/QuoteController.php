<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\QuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Suivi des demandes de devis professionnels. */
class QuoteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');

        $quotes = QuoteRequest::withCount('items')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($search, fn ($q) => $q->where(function ($q) use ($search) {
                $q->whereLoose('reference', $search)
                    ->orWhereLoose('company_name', $search)
                    ->orWhereLoose('contact_name', $search)
                    ->orWhereLoose('email', $search);
            }))
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 15), 100));

        return response()->json($quotes->toArray() + ['counts' => $this->counts()]);
    }

    public function show(QuoteRequest $quote): JsonResponse
    {
        return response()->json($quote->load(['items.product:id,name,slug,price,stock', 'user:id,name,email']));
    }

    public function update(Request $request, QuoteRequest $quote): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(QuoteRequest::STATUSES)],
            'quoted_total' => ['nullable', 'integer', 'min:0'],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $quote->update($data);

        return response()->json($quote->fresh(['items.product:id,name,slug,price,stock', 'user:id,name,email']));
    }

    private function counts(): array
    {
        $byStatus = QuoteRequest::selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return collect(QuoteRequest::STATUSES)->mapWithKeys(fn ($s) => [$s => (int) ($byStatus[$s] ?? 0)])->all();
    }
}
