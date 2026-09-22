<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Mailtrap\Helper\ResponseHelper;
use Mailtrap\MailtrapClient;
use Mailtrap\Mime\MailtrapEmail;
use Symfony\Component\Mime\Address;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Envoie un email de test réel via l'API Mailtrap, pour vérifier la configuration
// (MAILTRAP_API_KEY) indépendamment du reste de l'application.
// Usage : php artisan send-mail votre@email.com
Artisan::command('send-mail {to=ndioneabibou7@gmail.com}', function (string $to) {
    $apiKey = config('mail.mailers.mailtrap.api_key');

    if (! $apiKey) {
        $this->error('MAILTRAP_API_KEY est vide. Renseignez-le dans le fichier .env puis relancez.');

        return 1;
    }

    $email = (new MailtrapEmail())
        ->from(new Address(config('mail.from.address'), config('mail.from.name')))
        ->to(new Address($to))
        ->subject('Test Mailtrap — KamalPharMédis')
        ->category('Integration Test')
        ->text('Félicitations, votre configuration Mailtrap fonctionne !');

    $response = MailtrapClient::initSendingEmails(apiKey: $apiKey)->send($email);

    $this->info('Email envoyé avec succès :');
    $this->line(json_encode(ResponseHelper::toArray($response), JSON_PRETTY_PRINT));
})->purpose('Envoyer un email de test via Mailtrap');
