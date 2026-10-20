<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/** Alerte envoyée à la boutique à chaque nouvelle commande. « Répondre » écrit directement au client. */
class NewOrderAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $adminUrl;

    public function __construct(public Order $order)
    {
        $this->adminUrl = rtrim(config('app.frontend_url'), '/')."/admin/commandes/{$order->id}";
    }

    public function build(): self
    {
        $total = number_format($this->order->total, 0, ',', ' ');

        if ($this->order->user?->email) {
            $this->replyTo($this->order->user->email, $this->order->user->name);
        }

        return $this->subject("🛒 Nouvelle commande {$this->order->reference} — {$total} FCFA")
            ->view('emails.order-alert');
    }
}
