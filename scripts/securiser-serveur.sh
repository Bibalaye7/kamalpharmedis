#!/bin/bash
# Sécurise un serveur Ubuntu 24.04 NEUF avant d'y installer le site. À lancer UNE fois, en root,
# juste après l'achat du VPS :
#
#   - crée un utilisateur administrateur (sudo) qui se connecte par clé SSH uniquement ;
#   - interdit la connexion root et les mots de passe en SSH ;
#   - pare-feu UFW : tout est fermé sauf SSH (22), HTTP (80) et HTTPS (443) ;
#   - fail2ban : bannit les adresses qui essaient de deviner l'accès SSH ;
#   - mises à jour de sécurité automatiques (redémarrage à 4 h si nécessaire) ;
#   - réglages réseau du noyau contre les attaques courantes ;
#   - installe Docker et ajoute 2 Go de mémoire d'échange (swap) si le serveur n'en a pas.
#
# Prérequis : votre clé SSH publique a été ajoutée à la création du VPS (panneau de l'hébergeur)
# ou est collée en deuxième argument. Sans clé, le script s'arrête : il ne coupe jamais
# l'accès par mot de passe tant qu'une clé ne fonctionne pas.
#
# Usage (depuis le dossier du projet, ou après avoir copié ce seul fichier sur le serveur) :
#   bash securiser-serveur.sh kpm
#   bash securiser-serveur.sh kpm "ssh-ed25519 AAAA... votre-pc"
#
# IMPORTANT : gardez la session root ouverte et vérifiez dans une SECONDE fenêtre que
# « ssh kpm@IP » fonctionne avant de la fermer.
set -euo pipefail

UTILISATEUR="${1:-}"
CLE_PUBLIQUE="${2:-}"
PORT_SSH=22

erreur() {
  echo "ERREUR : $*" >&2
  exit 1
}

[ "$(id -u)" -eq 0 ] || erreur "lancez ce script en root (sudo bash $0 ...)."
[ -n "$UTILISATEUR" ] || erreur "indiquez le nom de l'utilisateur à créer, ex. : bash $0 kpm"
[[ "$UTILISATEUR" =~ ^[a-z][a-z0-9_-]{1,31}$ ]] || erreur "nom d'utilisateur invalide (minuscules, chiffres, - ou _)."
[ "$UTILISATEUR" != root ] || erreur "choisissez un autre nom que root."
grep -q 'VERSION_ID="24.04"' /etc/os-release || echo "Attention : script prévu pour Ubuntu 24.04."

# --- 1. Clé SSH : obligatoire avant de couper les mots de passe ---------------------------
if [ -z "$CLE_PUBLIQUE" ] && [ -s /root/.ssh/authorized_keys ]; then
  CLE_PUBLIQUE=$(grep -E '^(ssh-(ed25519|rsa)|ecdsa-sha2-)' /root/.ssh/authorized_keys || true)
fi
if ! printf '%s\n' "$CLE_PUBLIQUE" | grep -qE '^(ssh-(ed25519|rsa)|ecdsa-sha2-)[^ ]* [A-Za-z0-9+/=]{60,}'; then
  erreur "aucune clé SSH publique trouvée. Ajoutez-la à la création du VPS ou passez-la en 2e argument."
fi

# --- 2. Mises à jour et outils de sécurité -------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
echo "1/8 Mise à jour du système..."
apt-get update -q
apt-get -y -q -o Dpkg::Options::=--force-confold upgrade
apt-get -y -q install ufw fail2ban python3-systemd unattended-upgrades ca-certificates curl gnupg git

# --- 3. Utilisateur administrateur ---------------------------------------------------------
echo "2/8 Utilisateur $UTILISATEUR..."
if ! id "$UTILISATEUR" >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" "$UTILISATEUR"
fi
usermod -aG sudo "$UTILISATEUR"
install -d -m 700 -o "$UTILISATEUR" -g "$UTILISATEUR" "/home/$UTILISATEUR/.ssh"
CLES="/home/$UTILISATEUR/.ssh/authorized_keys"
touch "$CLES"
printf '%s\n' "$CLE_PUBLIQUE" | while IFS= read -r cle; do
  if [ -n "$cle" ] && ! grep -qxF "$cle" "$CLES"; then
    printf '%s\n' "$cle" >> "$CLES"
  fi
done
chown "$UTILISATEUR:$UTILISATEUR" "$CLES"
chmod 600 "$CLES"

# sudo demande un mot de passe : il sert uniquement sur le serveur, jamais pour se connecter
if passwd -S "$UTILISATEUR" | awk '{exit !($2 == "L" || $2 == "NP")}'; then
  echo "Choisissez le mot de passe sudo de $UTILISATEUR (long, gardé en lieu sûr) :"
  passwd "$UTILISATEUR"
fi

# --- 4. SSH : clé uniquement, pas de root ------------------------------------------------
echo "3/8 Durcissement de SSH..."
# Fichier lu en premier : ses valeurs l'emportent sur celles de l'hébergeur (50-cloud-init.conf)
cat > /etc/ssh/sshd_config.d/00-kamalpharmedis.conf <<EOF
Port $PORT_SSH
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitEmptyPasswords no
PubkeyAuthentication yes
AuthenticationMethods publickey
AllowUsers $UTILISATEUR
MaxAuthTries 3
LoginGraceTime 30
MaxStartups 10:30:60
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowAgentForwarding no
EOF
sshd -t || erreur "configuration SSH invalide : rien n'a été rechargé."
systemctl reload ssh

# --- 5. Pare-feu ---------------------------------------------------------------------------
echo "4/8 Pare-feu (seuls SSH, HTTP et HTTPS restent ouverts)..."
ufw --force reset >/dev/null
ufw default deny incoming
ufw default allow outgoing
ufw limit "$PORT_SSH/tcp" comment "SSH (6 essais / 30 s max)"
ufw allow 80/tcp comment "HTTP (redirige vers HTTPS)"
ufw allow 443/tcp comment "HTTPS"
ufw --force enable

# --- 6. fail2ban ---------------------------------------------------------------------------
echo "5/8 fail2ban..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
backend = systemd
banaction = ufw
# 5 échecs en 10 minutes = 1 heure de bannissement
findtime = 10m
maxretry = 5
bantime = 1h
bantime.increment = true
bantime.maxtime = 1w

[sshd]
enabled = true
port = $PORT_SSH

# Récidivistes (bannis plusieurs fois dans la journée) : 1 semaine
[recidive]
enabled = true
backend = auto
logpath = /var/log/fail2ban.log
findtime = 1d
maxretry = 3
bantime = 1w
EOF
systemctl enable fail2ban >/dev/null
systemctl restart fail2ban

# --- 7. Mises à jour de sécurité automatiques ---------------------------------------------
echo "6/8 Mises à jour automatiques..."
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
cat > /etc/apt/apt.conf.d/52kamalpharmedis-upgrades <<'EOF'
// Redémarrage à 4 h (après la sauvegarde de 3 h) seulement si une mise à jour l'exige ;
// les conteneurs du site redémarrent seuls.
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:00";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
EOF

# --- 8. Réglages réseau du noyau ------------------------------------------------------------
echo "7/8 Réglages réseau..."
cat > /etc/sysctl.d/99-kamalpharmedis.conf <<'EOF'
# Protection contre l'usurpation d'adresse, les redirections et l'inondation SYN
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.log_martians = 1
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
fs.protected_symlinks = 1
fs.protected_hardlinks = 1
EOF
sysctl --system >/dev/null

# --- 9. Docker et swap ----------------------------------------------------------------------
echo "8/8 Docker..."
if ! command -v docker >/dev/null 2>&1; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -q
  apt-get -y -q install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi
# Journaux Docker limités (évite de remplir le disque)
if [ ! -f /etc/docker/daemon.json ]; then
  mkdir -p /etc/docker
  cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" },
  "live-restore": true
}
EOF
  systemctl restart docker
fi
getent group docker >/dev/null || groupadd docker
usermod -aG docker "$UTILISATEUR"

# 2 Go de swap : la construction du site (Next.js) manque de mémoire sur un serveur de 4 Go
if [ -z "$(swapon --show --noheadings)" ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'vm.swappiness = 10' > /etc/sysctl.d/99-swap.conf
  sysctl -p /etc/sysctl.d/99-swap.conf >/dev/null
fi

IP=$(hostname -I | awk '{print $1}')
cat <<EOF

=== Serveur sécurisé ===
Pare-feu :
$(ufw status | sed 's/^/  /')

AVANT DE FERMER CETTE FENÊTRE, ouvrez une autre fenêtre sur votre PC et testez :
  ssh $UTILISATEUR@$IP      (ou l'adresse IP publique donnée par l'hébergeur)
Si la connexion marche, le serveur est prêt : connexion root et mots de passe désormais refusés.

Commandes utiles :
  sudo fail2ban-client status sshd     # adresses bannies
  sudo fail2ban-client set sshd unbanip ADRESSE
  sudo ufw status verbose
EOF
