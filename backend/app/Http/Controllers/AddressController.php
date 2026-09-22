<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->orderBy('id')->get();

        return response()->json(['data' => $addresses]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $user = $request->user();

        // La première adresse devient automatiquement l'adresse par défaut
        $makeDefault = ($data['is_default'] ?? false) || ! $user->addresses()->exists();

        $address = $user->addresses()->create($data);

        if ($makeDefault) {
            $this->setDefault($address);
        }

        return response()->json($address->fresh(), 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        $this->authorizeOwner($request, $address);

        $data = $request->validate($this->rules(false));
        $address->update($data);

        if ($data['is_default'] ?? false) {
            $this->setDefault($address);
        }

        return response()->json($address->fresh());
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorizeOwner($request, $address);

        $wasDefault = $address->is_default;
        $address->delete();

        if ($wasDefault && $next = $request->user()->addresses()->first()) {
            $this->setDefault($next);
        }

        return response()->json(['message' => 'Adresse supprimée.']);
    }

    private function authorizeOwner(Request $request, Address $address): void
    {
        abort_unless($address->user_id === $request->user()->id, 404);
    }

    private function setDefault(Address $address): void
    {
        Address::where('user_id', $address->user_id)->where('id', '!=', $address->id)->update(['is_default' => false]);
        $address->update(['is_default' => true]);
    }

    private function rules(bool $creating = true): array
    {
        $required = $creating ? 'required' : 'sometimes';

        return [
            'label' => ['nullable', 'string', 'max:40'],
            'full_name' => [$required, 'string', 'max:255'],
            'phone' => [$required, 'string', 'max:30'],
            'line1' => [$required, 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'city' => [$required, 'string', 'max:80'],
            'region' => ['nullable', 'string', 'max:80'],
            'country' => ['nullable', 'string', 'max:80'],
            'is_default' => ['boolean'],
        ];
    }
}
