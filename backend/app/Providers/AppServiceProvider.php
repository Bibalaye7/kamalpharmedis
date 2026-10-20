<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Illuminate\Support\ServiceProvider;
use Mailtrap\Bridge\Transport\MailtrapSdkTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Envoi transactionnel via l'API Mailtrap (SDK officiel railsware/mailtrap-php),
        // utilisé quand MAIL_MAILER=mailtrap. Voir config/mail.php pour la config du mailer.
        Mail::extend('mailtrap', function (array $config = []) {
            $dsn = new Dsn('mailtrap+sdk', 'default', $config['api_key'] ?? null);

            return (new MailtrapSdkTransportFactory())->create($dsn);
        });

        // Connexion : 10 essais par minute pour un même compte (bloque qui devine un mot de passe),
        // 200 par minute par adresse IP. Au Sénégal, les opérateurs mobiles font passer beaucoup
        // d'abonnés par la même IP publique : une limite par IP seule bloquerait de vrais clients.
        RateLimiter::for('login', fn (Request $request) => [
            Limit::perMinute(10)->by('compte:'.Str::lower((string) $request->input('email')).'|'.$request->ip()),
            Limit::perMinute(200)->by('ip:'.$request->ip()),
        ]);

        // Identifiants numériques dans les URL : sous PostgreSQL, « /orders/abc » ferait une erreur SQL
        // (texte comparé à un entier) ; avec ce filtre la route renvoie simplement 404.
        // {product} n'est pas concerné globalement : la fiche produit accepte aussi un slug.
        Route::patterns(array_fill_keys(['order', 'quote', 'review', 'user', 'item', 'address', 'contactMessage', 'category'], '[0-9]+'));

        // Recherche « souple » : ignore majuscules et accents (« electrode » trouve « Électrode »).
        // MySQL le fait via sa collation ; PostgreSQL a besoin de ILIKE + l'extension unaccent.
        QueryBuilder::macro('whereLoose', function (string $column, string $value, string $boolean = 'and') {
            /** @var QueryBuilder $this */
            $pattern = '%'.addcslashes($value, '%_\\').'%';

            if ($this->getConnection()->getDriverName() === 'pgsql') {
                return $this->whereRaw('unaccent('.$this->getGrammar()->wrap($column).'::text) ilike unaccent(?)', [$pattern], $boolean);
            }

            return $this->where($column, 'like', $pattern, $boolean);
        });

        QueryBuilder::macro('orWhereLoose', function (string $column, string $value) {
            /** @var QueryBuilder $this */
            return $this->whereLoose($column, $value, 'or');
        });
    }
}
