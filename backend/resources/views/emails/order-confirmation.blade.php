<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Votre commande KamalPharMédis</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F7FF;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F7FF;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background-color:#1A3A8F;padding:28px 32px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:bold;">KamalPharMédis</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:20px;color:#1A3A8F;">Merci pour votre commande, {{ $order->shipping_name ?: $order->user?->name }} !</h1>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#333333;">
                Votre commande <strong>{{ $order->reference }}</strong> du {{ $order->created_at->format('d/m/Y à H:i') }}
                est bien enregistrée. Nous la préparons et vous pouvez suivre son état à tout moment dans votre espace client.
              </p>

              @include('emails.partials.order-summary')

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
                <tr>
                  <td style="border-radius:26px;background-color:#2454C7;">
                    <a href="{{ $orderUrl }}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:26px;">
                      Suivre ma commande
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#5A6478;">
                Une question ? Répondez simplement à cet email, ou appelez-nous / écrivez-nous sur WhatsApp au
                {{ config('services.orders.contact_phones') }}.
              </p>
              <p style="margin:12px 0 0;font-size:11px;line-height:1.6;color:#9AA5B8;">
                Vous pouvez annuler votre commande depuis votre espace client tant qu'elle n'est pas expédiée.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
