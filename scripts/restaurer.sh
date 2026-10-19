#!/bin/sh
# Restaure une sauvegarde faite par scripts/sauvegarde.sh, sur le serveur de production.
#
# Usage, depuis la racine du projet :
#   sh scripts/restaurer.sh sauvegardes/base_2026-10-20_030000.dump
#   sh scripts/restaurer.sh sauvegardes/photos_2026-10-20_030000.tar.gz
#
# ATTENTION : la base (ou les photos) actuelle est REMPLACÉE par le contenu de la sauvegarde.
# Une sauvegarde de l'état actuel est faite juste avant, par précaution.
set -eu

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
FICHIER="${1:-}"

if [ -z "$FICHIER" ] || [ ! -f "$FICHIER" ]; then
  echo "Usage : sh scripts/restaurer.sh sauvegardes/<fichier .dump ou .tar.gz>" >&2
  echo "Sauvegardes disponibles (les plus récentes d'abord) :" >&2
  ls -1t sauvegardes 2>/dev/null | head -n 20 >&2 || true
  exit 1
fi

case "$FICHIER" in
  *.dump | *.tar.gz) ;;
  *)
    echo "Fichier non reconnu : .dump (base) ou .tar.gz (photos) attendu." >&2
    exit 1
    ;;
esac

printf 'Remplacer les données actuelles du site par %s ? Tapez OUI pour confirmer : ' "$FICHIER"
read -r reponse
[ "$reponse" = "OUI" ] || { echo "Annulé."; exit 1; }

$COMPOSE exec -T sauvegarde sh /scripts/sauvegarde.sh

case "$FICHIER" in
  *.dump)
    $COMPOSE exec -T sauvegarde sh -c 'pg_restore --clean --if-exists --no-owner --no-privileges --dbname="$PGDATABASE"' < "$FICHIER"
    $COMPOSE exec -T backend php artisan cache:clear
    echo "Base de données restaurée depuis $FICHIER."
    ;;
  *.tar.gz)
    $COMPOSE exec -T backend sh -c 'tar -xzf - -C storage/app/public && chown -R www-data:www-data storage/app/public' < "$FICHIER"
    echo "Photos restaurées depuis $FICHIER."
    ;;
esac
