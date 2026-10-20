<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

/** Confirmation envoyée au client juste après sa commande. */
class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $orderUrl;

    public function __construct(public Order $order)
    {
        $this->orderUrl = rtrim(config('app.frontend_url'), '/')."/compte/commandes/{$order->id}";
    }

    public function build(): self
    {
        return $this->subject("Votre commande {$this->order->reference} est bien enregistrée — KamalPharMédis")
            ->replyTo(config('services.orders.notify_email'), 'KamalPharMédis')
            ->view('emails.order-confirmation');
    }
}
