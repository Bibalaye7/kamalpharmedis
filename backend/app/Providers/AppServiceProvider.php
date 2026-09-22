<?php

namespace App\Providers;

use Illuminate\Support\Facades\Mail;
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
    }
}
