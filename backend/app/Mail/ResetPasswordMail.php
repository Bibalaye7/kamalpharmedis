<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $resetUrl;

    public function __construct(public User $user, string $token)
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $this->resetUrl = "{$frontendUrl}/reinitialiser-mot-de-passe?token={$token}&email=".urlencode($user->email);
    }

    public function build(): self
    {
        return $this->subject('Réinitialisation de votre mot de passe — KamalPharMédis')
            ->view('emails.reset-password');
    }
}
