<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | PayDunya (paiement Wave, Orange Money, Free Money, carte bancaire)
    |--------------------------------------------------------------------------
    |
    | Clés obtenues sur https://paydunya.com (Développeurs > Applications),
    | en mode "TEST" pour commencer — aucune vérification d'entreprise requise.
    */
    'paydunya' => [
        'master_key' => env('PAYDUNYA_MASTER_KEY'),
        'private_key' => env('PAYDUNYA_PRIVATE_KEY'),
        'public_key' => env('PAYDUNYA_PUBLIC_KEY'),
        'token' => env('PAYDUNYA_TOKEN'),
        'mode' => env('PAYDUNYA_MODE', 'test'), // "test" ou "live"
    ],

    /*
    |--------------------------------------------------------------------------
    | Paiement manuel (transfert Wave / Orange Money vers l'entreprise)
    |--------------------------------------------------------------------------
    |
    | Utilisé tant que le paiement en ligne n'est pas configuré. Le client envoie
    | le montant à ces numéros puis déclare l'identifiant de sa transaction.
    */
    'manual_payment' => [
        'account_name' => env('MANUAL_PAYMENT_NAME', 'KamalPharMédis'),
        'wave' => env('MANUAL_PAYMENT_WAVE', '+221 70 464 12 81'),
        'orange_money' => env('MANUAL_PAYMENT_ORANGE_MONEY', '+221 75 661 62 62'),
    ],

];
