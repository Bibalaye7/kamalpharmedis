<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Confirmez votre adresse email</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F7FF;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F7FF;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:20px;overflow:hidden;">
          <tr>
            <td style="background-color:#1A3A8F;padding:28px 32px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:bold;">KamalPharMédis</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#1A3A8F;">Bienvenue, {{ $user->name }} !</h1>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#333333;">
                Merci de vous être inscrit(e) sur KamalPharMédis. Pour activer votre compte et accéder à votre
                espace client, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:26px;background-color:#2454C7;">
                    <a href="{{ $verifyUrl }}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:26px;">
                      Confirmer mon adresse email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#5A6478;">
                Ce lien expire dans 60 minutes. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
              </p>
              <p style="margin:16px 0 0;font-size:11px;line-height:1.6;color:#9AA5B8;word-break:break-all;">
                Ou copiez ce lien dans votre navigateur : {{ $verifyUrl }}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
