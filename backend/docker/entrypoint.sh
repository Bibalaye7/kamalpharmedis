#!/bin/sh
set -e

# Attend que MySQL accepte les connexions avant de lancer les migrations
echo "Attente de MySQL (${DB_HOST:-mysql}:${DB_PORT:-3306})..."
until php -r "new PDO('mysql:host=${DB_HOST:-mysql};port=${DB_PORT:-3306}', '${DB_USERNAME:-root}', '${DB_PASSWORD:-}');" 2>/dev/null; do
  sleep 2
done
echo "MySQL est prêt."

if [ ! -f .env ]; then
  cp .env.example .env
fi

# APP_KEY / JWT_SECRET sont normalement fournis par les variables d'environnement
# du conteneur (docker-compose) ; on ne les régénère que s'ils manquent vraiment,
# pour ne pas invalider les sessions et tokens à chaque redémarrage.
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force --no-interaction
fi
if [ -z "$JWT_SECRET" ]; then
  php artisan jwt:secret --force --no-interaction || true
fi

php artisan config:clear
php artisan migrate --force --no-interaction

# Peuple la base uniquement si elle est vide (ne duplique jamais les données de démo)
USERS_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null | tail -1)
if [ "$USERS_COUNT" = "0" ]; then
  echo "Base vide : exécution des seeders..."
  php artisan db:seed --force --no-interaction
fi

php artisan storage:link || true
php artisan config:cache
php artisan route:cache

exec "$@"
