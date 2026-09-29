<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = $request->input('search');

        $users = User::withCount('orders')
            ->withSum(['orders as total_spent' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'total')
            ->when($search, fn ($q) => $q->where(fn ($q) => $q->whereLoose('name', $search)
                ->orWhereLoose('email', $search)))
            ->when($request->filled('role'), fn ($q) => $q->whereHas('role', fn ($r) => $r->where('name', $request->input('role'))))
            ->latest('id')
            ->paginate(min((int) $request->input('per_page', 15), 100));

        return response()->json($users);
    }

    public function roles(): JsonResponse
    {
        return response()->json(['data' => Role::orderBy('id')->get()]);
    }

    public function show(User $user): JsonResponse
    {
        $user->loadCount('orders')->load(['addresses', 'orders' => fn ($q) => $q->latest('id')->take(10)]);

        return response()->json($user);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', Password::min(8)],
            'role' => ['required', Rule::exists('roles', 'name')],
            'is_active' => ['boolean'],
        ]);

        $user = User::create([
            ...collect($data)->except('role')->all(),
            'role_id' => Role::where('name', $data['role'])->value('id'),
        ]);

        return response()->json($user->fresh(), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', Password::min(8)],
            'role' => ['sometimes', 'required', Rule::exists('roles', 'name')],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        // Un admin ne peut pas se rétrograder ni se désactiver lui-même
        if ($user->id === $request->user()->id) {
            if (isset($data['role']) && $data['role'] !== $user->role_name) {
                return response()->json(['message' => 'Vous ne pouvez pas modifier votre propre rôle.'], 422);
            }

            if (array_key_exists('is_active', $data) && ! $data['is_active']) {
                return response()->json(['message' => 'Vous ne pouvez pas désactiver votre propre compte.'], 422);
            }
        }

        if (isset($data['role'])) {
            $data['role_id'] = Role::where('name', $data['role'])->value('id');
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update(collect($data)->except('role')->all());

        return response()->json($user->fresh());
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        if ($user->orders()->exists()) {
            return response()->json([
                'message' => 'Cet utilisateur a des commandes : désactivez son compte plutôt que de le supprimer.',
            ], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
