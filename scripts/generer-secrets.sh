#!/bin/sh
# Génère, sur le serveur de production, les clés secrètes manquantes du fichier .env :
# DB_PASSWORD, APP_KEY et JWT_SECRET. Une valeur déjà remplie n'est JAMAIS remplacée
# (changer DB_PASSWORD après le premier démarrage bloquerait l'accès à la base).
#
# Usage, depuis la racine du projet : sh scripts/generer-secrets.sh
set -eu

ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Fichier $ENV_FILE introuvable : copiez d'abord .env.production.example en .env" >&2
  exit 1
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl est requis (apt install openssl)." >&2
  exit 1
fi

# Valeur actuelle d'une variable (vide si absente)
current() {
  grep -E "^$1=" "$ENV_FILE" | tail -n 1 | cut -d= -f2-
}

# Écrit VAR=valeur (remplace la ligne existante ou l'ajoute)
write() {
  if grep -qE "^$1=" "$ENV_FILE"; then
    tmp=$(mktemp)
    awk -v k="$1" -v v="$2" 'BEGIN { FS = OFS = "=" } $1 == k { print k "=" v; next } { print }' "$ENV_FILE" > "$tmp"
    cat "$tmp" > "$ENV_FILE" && rm -f "$tmp"
  else
    printf '%s=%s\n' "$1" "$2" >> "$ENV_FILE"
  fi
}

generate() {
  var="$1"
  value="$2"
  old=$(current "$var")
  case "$old" in
    "" | change-moi-en-production | kamalpharmedis)
      write "$var" "$value"
      echo "  $var : générée"
      ;;
    *)
      echo "  $var : déjà définie, conservée"
      ;;
  esac
}

echo "Clés secrètes de $ENV_FILE :"
generate DB_PASSWORD "$(openssl rand -hex 24)"
generate APP_KEY "base64:$(openssl rand -base64 32)"
generate JWT_SECRET "$(openssl rand -hex 32)"

# Fichier lisible uniquement par son propriétaire
chmod 600 "$ENV_FILE"
echo "Terminé. Conservez une copie de $ENV_FILE en lieu sûr (hors du serveur et hors de GitHub)."
