<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Désactive les comptes de démonstration (identifiants publiés dans d'anciennes versions du code) :
 * mot de passe remplacé par une valeur aléatoire et compte bloqué. Les commandes associées sont conservées.
 */
class DisableDemoAccounts extends Command
{
    protected $signature = 'kpm:disable-demo';

    protected $description = 'Désactive les anciens comptes de démonstration (admin, manager, clients fictifs)';

    private const DEMO_EMAILS = [
        'admin@kamalpharmedis.com',
        'manager@kamalpharmedis.com',
        'aminata@email.com',
        'moussa@email.com',
        'fatou@email.com',
    ];

    public function handle(): int
    {
        $users = User::whereIn('email', self::DEMO_EMAILS)->get();

        foreach ($users as $user) {
            $user->forceFill(['password' => Str::random(64), 'is_active' => false])->save();
            $this->line("Désactivé : {$user->email}");
        }

        $this->info($users->count().' compte(s) de démonstration désactivé(s).');

        return self::SUCCESS;
    }
}
