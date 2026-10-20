<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Nouvelle commande</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F7FF;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F7FF;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background-color:#ffffff;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background-color:#2EA138;padding:24px 32px;text-align:center;">
              <span style="color:#ffffff;font-size:18px;font-weight:bold;">KamalPharMédis · Nouvelle commande</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px;font-size:20px;color:#1A3A8F;">🛒 Commande {{ $order->reference }}</h1>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#333333;">
                Reçue le {{ $order->created_at->format('d/m/Y à H:i') }}.<br>
                <strong>Client :</strong> {{ $order->user?->name }}<br>
                <strong>Email :</strong> {{ $order->user?->email }}<br>
                <strong>Téléphone :</strong> {{ $order->shipping_phone ?: $order->user?->phone }}
              </p>

              @include('emails.partials.order-summary')

              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;">
                <tr>
                  <td style="border-radius:26px;background-color:#2454C7;">
                    <a href="{{ $adminUrl }}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:26px;">
                      Ouvrir la commande
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#5A6478;">
                « Répondre » à cet email écrit directement au client. Pensez à confirmer la commande dans
                l'administration : le client voit son avancement dans son espace.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
