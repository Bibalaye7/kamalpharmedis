<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

/**
 * Crée ou met à jour un compte administrateur / gestionnaire.
 * Le mot de passe est saisi de façon masquée : il n'apparaît ni dans le code, ni dans l'historique.
 *
 *   docker exec -it kpm_backend php artisan kpm:staff
 *   docker exec -it kpm_backend php artisan kpm:staff --role=manager
 */
class CreateStaffAccount extends Command
{
    protected $signature = 'kpm:staff {--role=admin : admin ou manager}';

    protected $description = 'Crée ou met à jour un compte administrateur ou gestionnaire';

    public function handle(): int
    {
        $role = $this->option('role');
        if (! in_array($role, [Role::ADMIN, Role::MANAGER], true)) {
            $this->error('Rôle invalide : utilisez admin ou manager.');

            return self::FAILURE;
        }

        $data = [
            'name' => $this->ask('Nom complet'),
            'email' => mb_strtolower(trim((string) $this->ask('Adresse email'))),
            'phone' => $this->ask('Téléphone (facultatif)') ?: null,
            'password' => $this->secret('Mot de passe (12 caractères minimum, masqué)'),
        ];
        $data['password_confirmation'] = $this->secret('Confirmez le mot de passe');

        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $existing = User::where('email', $data['email'])->first();
        if ($existing && ! $this->confirm("Le compte {$data['email']} existe déjà : le mettre à jour ?", true)) {
            return self::FAILURE;
        }

        User::updateOrCreate(['email' => $data['email']], [
            'name' => $data['name'],
            'phone' => $data['phone'],
            'password' => $data['password'],
            'role_id' => Role::where('name', $role)->value('id'),
            'is_active' => true,
        ]);

        $this->info(($existing ? 'Compte mis à jour' : 'Compte créé')." : {$data['email']} ({$role})");

        return self::SUCCESS;
    }
}
