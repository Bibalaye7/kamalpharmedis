<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = $request->user()->wishlist()
            ->with('category:id,name,slug')
            ->orderByPivot('created_at', 'desc')
            ->get();

        return response()->json(['data' => $products]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['product_id' => ['required', 'integer', 'exists:products,id']]);

        $request->user()->wishlist()->syncWithoutDetaching([Product::findOrFail($data['product_id'])->id]);

        return $this->index($request);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        $request->user()->wishlist()->detach($productId);

        return $this->index($request);
    }
}
