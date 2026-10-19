#!/bin/sh
# Obtient le certificat HTTPS Let's Encrypt du site. À lancer UNE fois sur le serveur, après
# avoir fait pointer le nom de domaine vers son adresse IP. Le renouvellement est ensuite
# automatique (service certbot de docker-compose.prod.yml).
#
# Prérequis :
#   - dans .env : SITE_DOMAIN (ex. kamalpharmedis.sn) et LETSENCRYPT_EMAIL ;
#   - DNS : SITE_DOMAIN et www.SITE_DOMAIN pointent vers l'IP du serveur ;
#   - ports 80 et 443 ouverts dans le pare-feu du serveur.
#
# Usage, depuis la racine du projet : sh scripts/activer-https.sh
set -eu

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
LIVE=/etc/letsencrypt/live/site

valeur() {
  grep -E "^$1=" .env | tail -n 1 | cut -d= -f2-
}

DOMAINE=$(valeur SITE_DOMAIN)
EMAIL=$(valeur LETSENCRYPT_EMAIL)
if [ -z "$DOMAINE" ] || [ -z "$EMAIL" ]; then
  echo "Renseignez SITE_DOMAIN et LETSENCRYPT_EMAIL dans .env." >&2
  exit 1
fi

if $COMPOSE run --rm --no-deps --entrypoint sh certbot -c "test -f /etc/letsencrypt/renewal/site.conf" 2>/dev/null; then
  echo "Le certificat Let's Encrypt existe déjà ; il est renouvelé automatiquement."
  exit 0
fi

# 1. Certificat provisoire auto-signé : nginx refuse de démarrer sans certificat
echo "Création d'un certificat provisoire..."
$COMPOSE run --rm --no-deps --entrypoint sh certbot -c "mkdir -p $LIVE && openssl req -x509 -nodes -newkey rsa:2048 -days 1 -subj /CN=$DOMAINE -keyout $LIVE/privkey.pem -out $LIVE/fullchain.pem"

# 2. Démarrage du site : nginx sert la vérification de Let's Encrypt sur le port 80
$COMPOSE up -d --build

# 3. Remplacement par le vrai certificat
echo "Demande du certificat Let's Encrypt pour $DOMAINE et www.$DOMAINE..."
$COMPOSE run --rm --no-deps --entrypoint sh certbot -c "rm -rf $LIVE /etc/letsencrypt/archive/site"
$COMPOSE run --rm --no-deps --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --cert-name site -d "$DOMAINE" -d "www.$DOMAINE" \
  --email "$EMAIL" --agree-tos --no-eff-email --non-interactive

$COMPOSE exec nginx nginx -s reload
echo "HTTPS activé : https://$DOMAINE"
