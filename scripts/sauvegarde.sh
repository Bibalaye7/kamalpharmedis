#!/bin/sh
# Sauvegarde de KamalPharMédis : base de données PostgreSQL + photos produits.
# Tourne dans le conteneur « sauvegarde » (voir docker-compose.prod.yml).
#
#   sauvegarde.sh                 une sauvegarde immédiate
#   sauvegarde.sh --chaque-nuit   une sauvegarde chaque jour à SAUVEGARDE_HEURE (03:00 par défaut)
#
# Fichiers produits dans le dossier sauvegardes/ du serveur :
#   base_AAAA-MM-JJ_HHMMSS.dump       base complète (format pg_dump compressé)
#   photos_AAAA-MM-JJ_HHMMSS.tar.gz   photos produits
# Seuls les SAUVEGARDE_JOURS derniers jours sont conservés (14 par défaut).
# Restauration : scripts/restaurer.sh
set -eu

DOSSIER=/sauvegardes
JOURS="${SAUVEGARDE_JOURS:-14}"
HEURE="${SAUVEGARDE_HEURE:-03:00}"

sauvegarder() {
  horodatage=$(date +%Y-%m-%d_%H%M%S)
  base="$DOSSIER/base_$horodatage.dump"
  photos="$DOSSIER/photos_$horodatage.tar.gz"
  mkdir -p "$DOSSIER"

  # Écriture dans un fichier .partiel d'abord : une sauvegarde interrompue n'est jamais
  # confondue avec une sauvegarde complète.
  pg_dump --format=custom --no-owner --no-privileges --file="$base.partiel"
  mv "$base.partiel" "$base"

  tar -czf "$photos.partiel" -C /photos .
  mv "$photos.partiel" "$photos"

  # Anciennes sauvegardes et restes de sauvegardes interrompues
  find "$DOSSIER" -maxdepth 1 \( -name 'base_*.dump' -o -name 'photos_*.tar.gz' \) -mtime +"$JOURS" -delete
  find "$DOSSIER" -maxdepth 1 -name '*.partiel' -mmin +60 -delete

  echo "[$(date '+%Y-%m-%d %H:%M')] Sauvegarde terminée : $(basename "$base") ($(du -h "$base" | cut -f1)), $(basename "$photos") ($(du -h "$photos" | cut -f1))"
}

if [ "${1:-}" != "--chaque-nuit" ]; then
  sauvegarder
  exit 0
fi

echo "Sauvegarde automatique chaque jour à $HEURE (conservation : $JOURS jours)."
trap 'exit 0' TERM INT
while :; do
  maintenant=$(date +%s)
  prochaine=$(date -d "$HEURE" +%s)
  if [ "$prochaine" -le "$maintenant" ]; then
    prochaine=$((prochaine + 86400))
  fi
  sleep $((prochaine - maintenant)) &
  wait $!
  # Une sauvegarde ratée (base momentanément indisponible...) n'empêche pas les suivantes
  sauvegarder || echo "[$(date '+%Y-%m-%d %H:%M')] ÉCHEC de la sauvegarde" >&2
done
