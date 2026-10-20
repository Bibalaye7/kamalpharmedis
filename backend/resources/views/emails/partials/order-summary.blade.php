@php
  $fcfa = fn (int $n) => number_format($n, 0, ',', ' ').' FCFA';
  $paiements = [
    'cash_on_delivery' => 'Paiement à la livraison (espèces, Wave ou Orange Money au livreur)',
    'mobile_money' => 'Wave / Orange Money',
    'card' => 'Carte bancaire',
    'bank_transfer' => 'Virement bancaire',
  ];
@endphp
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;color:#333333;">
  <tr>
    <td style="padding:8px 0;border-bottom:2px solid #E3E9F7;font-weight:bold;color:#1A3A8F;">Produit</td>
    <td style="padding:8px 0;border-bottom:2px solid #E3E9F7;font-weight:bold;color:#1A3A8F;text-align:center;">Qté</td>
    <td style="padding:8px 0;border-bottom:2px solid #E3E9F7;font-weight:bold;color:#1A3A8F;text-align:right;">Total</td>
  </tr>
  @foreach ($order->items as $item)
  <tr>
    <td style="padding:10px 8px 10px 0;border-bottom:1px solid #EEF2FB;">
      {{ $item->product_name }}<br>
      <span style="font-size:11px;color:#8A94A8;">{{ $fcfa($item->unit_price) }} l'unité</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid #EEF2FB;text-align:center;">{{ $item->quantity }}</td>
    <td style="padding:10px 0;border-bottom:1px solid #EEF2FB;text-align:right;white-space:nowrap;">{{ $fcfa($item->total) }}</td>
  </tr>
  @endforeach
  <tr>
    <td colspan="2" style="padding:10px 0 4px;color:#5A6478;">Sous-total</td>
    <td style="padding:10px 0 4px;text-align:right;white-space:nowrap;">{{ $fcfa($order->subtotal) }}</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:4px 0;color:#5A6478;">Livraison</td>
    <td style="padding:4px 0;text-align:right;white-space:nowrap;">{{ $order->shipping_fee > 0 ? $fcfa($order->shipping_fee) : 'Offerte' }}</td>
  </tr>
  <tr>
    <td colspan="2" style="padding:8px 0;font-size:15px;font-weight:bold;color:#1A3A8F;">Total</td>
    <td style="padding:8px 0;font-size:15px;font-weight:bold;color:#1A3A8F;text-align:right;white-space:nowrap;">{{ $fcfa($order->total) }}</td>
  </tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background-color:#F4F7FF;border-radius:12px;font-size:13px;line-height:1.6;color:#333333;">
  <tr>
    <td style="padding:14px 16px;">
      <strong style="color:#1A3A8F;">Livraison</strong><br>
      {{ $order->shipping_name }} · {{ $order->shipping_phone }}<br>
      {{ $order->shipping_address }}, {{ $order->shipping_city }}
      <br><br>
      <strong style="color:#1A3A8F;">Paiement</strong><br>
      {{ $paiements[$order->payment_method] ?? $order->payment_method }}
      @if ($order->notes)
        <br><br><strong style="color:#1A3A8F;">Remarque du client</strong><br>{{ $order->notes }}
      @endif
    </td>
  </tr>
</table>
