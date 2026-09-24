<?php

namespace App\Http\Controllers;

use App\Mail\ResetPasswordMail;
use App\Mail\VerifyEmailMail;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Confirmation par email désactivée (EMAIL_VERIFICATION_REQUIRED=false) : le compte est
        // actif immédiatement et le client est connecté à son espace.
        if (! config('app.require_email_verification')) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'role_id' => Role::where('name', Role::CLIENT)->value('id'),
            ]);
            $user->forceFill(['email_verified_at' => now(), 'last_login_at' => now()])->save();

            return $this->respondWithToken(auth('api')->login($user), $user->fresh(), 201);
        }

        $token = Str::random(64);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'role_id' => Role::where('name', Role::CLIENT)->value('id'),
            'email_verification_token' => hash('sha256', $token),
            'email_verification_expires_at' => now()->addMinutes(60),
        ]);

        // Un compte ne doit jamais exister sans qu'un email de confirmation soit parti :
        // si l'envoi échoue, l'inscription est annulée pour que le client puisse réessayer.
        if (! $this->sendMail($user->email, new VerifyEmailMail($user, $token))) {
            $user->delete();

            return response()->json([
                'message' => "Nous n'avons pas pu envoyer l'email de confirmation. Votre compte n'a pas été créé : réessayez dans quelques instants ou contactez-nous.",
            ], 503);
        }

        return response()->json([
            'message' => 'Compte créé ! Consultez votre boîte email pour confirmer votre adresse avant de vous connecter.',
            'email_sent' => true,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! $token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        $user = auth('api')->user();

        if (! $user->is_active) {
            auth('api')->logout();

            return response()->json(['message' => 'Ce compte est désactivé. Contactez-nous.'], 403);
        }

        if (config('app.require_email_verification') && ! $user->email_verified_at) {
            auth('api')->logout();

            return response()->json([
                'message' => 'Veuillez confirmer votre adresse email avant de vous connecter. Vérifiez votre boîte de réception.',
                'email_unverified' => true,
            ], 403);
        }

        $user->forceFill(['last_login_at' => now()])->saveQuietly();

        return $this->respondWithToken($token, $user);
    }

    /** Confirme l'adresse email à partir du lien reçu, puis connecte l'utilisateur. */
    public function verifyEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (
            ! $user
            || ! $user->email_verification_token
            || ! hash_equals($user->email_verification_token, hash('sha256', $data['token']))
            || ! $user->email_verification_expires_at
            || $user->email_verification_expires_at->isPast()
        ) {
            return response()->json(['message' => 'Lien de confirmation invalide ou expiré.'], 422);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'email_verification_token' => null,
            'email_verification_expires_at' => null,
        ])->save();

        $token = auth('api')->login($user);

        return $this->respondWithToken($token, $user->fresh());
    }

    /** Renvoie un email de confirmation (throttlé) si le compte n'est pas encore vérifié. */
    public function resendVerification(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $data['email'])->first();

        // Réponse identique que le compte existe ou non, pour ne pas divulguer les emails inscrits.
        if (! $user || $user->email_verified_at) {
            return response()->json(['message' => 'Si ce compte existe et n\'est pas encore confirmé, un email vient d\'être envoyé.']);
        }

        $token = Str::random(64);
        $user->forceFill([
            'email_verification_token' => hash('sha256', $token),
            'email_verification_expires_at' => now()->addMinutes(60),
        ])->save();

        $this->sendMail($user->email, new VerifyEmailMail($user, $token));

        return response()->json(['message' => 'Si ce compte existe et n\'est pas encore confirmé, un email vient d\'être envoyé.']);
    }

    /** Envoie un email de réinitialisation de mot de passe (throttlé). */
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        $user = User::where('email', $data['email'])->first();

        if ($user) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => hash('sha256', $token), 'created_at' => now()]
            );

            $this->sendMail($user->email, new ResetPasswordMail($user, $token));
        }

        // Réponse identique que l'email existe ou non, pour ne pas divulguer les comptes inscrits.
        return response()->json(['message' => 'Si un compte existe avec cet email, un lien de réinitialisation vient d\'être envoyé.']);
    }

    /** Valide le lien reçu par email et enregistre le nouveau mot de passe. */
    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (
            ! $record
            || ! hash_equals($record->token, hash('sha256', $data['token']))
            || now()->diffInMinutes($record->created_at) > 60
        ) {
            return response()->json(['message' => 'Lien de réinitialisation invalide ou expiré.'], 422);
        }

        $user = User::where('email', $data['email'])->firstOrFail();
        $user->update(['password' => $data['password']]);

        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.']);
    }

    public function me(): JsonResponse
    {
        return response()->json(['user' => auth('api')->user()]);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /** Route publique : accepte un token expiré tant qu'il est dans la fenêtre de refresh. */
    public function refresh(): JsonResponse
    {
        try {
            $token = auth('api')->refresh();
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Session expirée, veuillez vous reconnecter.'], 401);
        }

        return $this->respondWithToken($token, auth('api')->setToken($token)->user());
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $user->update($data);

        return response()->json(['user' => $user->fresh(), 'message' => 'Profil mis à jour.']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password:api'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $request->user()->update(['password' => $data['password']]);

        return response()->json(['message' => 'Mot de passe modifié.']);
    }

    /** Envoie un email sans jamais faire échouer la requête : l'erreur est journalisée. */
    private function sendMail(string $to, \Illuminate\Contracts\Mail\Mailable $mailable): bool
    {
        try {
            Mail::to($to)->send($mailable);

            return true;
        } catch (\Throwable $e) {
            report($e);

            return false;
        }
    }

    private function respondWithToken(string $token, User $user, int $status = 200): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
            'user' => $user,
        ], $status);
    }
}
