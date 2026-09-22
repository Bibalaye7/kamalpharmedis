<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerifyEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $verifyUrl;

    public function __construct(public User $user, string $token)
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $this->verifyUrl = "{$frontendUrl}/verifier-email?token={$token}&email=".urlencode($user->email);
    }

    public function build(): self
    {
        return $this->subject('Confirmez votre adresse email — KamalPharMédis')
            ->view('emails.verify-email');
    }
}
