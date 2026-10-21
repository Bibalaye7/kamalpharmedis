# KamalPharMédis

Boutique en ligne de matériel et de consommables médicaux, livrés à Dakar et partout au Sénégal.

## Technologies utilisées

| Rôle                              | Technologie                                                   |
|-----------------------------------|---------------------------------------------------------------|
| Site (pages vues par les clients) | Next.js 14 + TypeScript + Tailwind CSS                        |
| Serveur (API)                     | Laravel 11, PHP-FPM, authentification par jetons JWT          |
| Base de données                   | PostgreSQL 16                                                 |
| Mémoire cache                     | Redis 7                                                       |
| Serveur web (point d'entrée)      | Nginx (HTTPS en production)                                   |
| Consultation de la base           | Adminer                                                       |

Le tout tourne dans des conteneurs Docker.

## Organisation des dossiers

```
kamalpharmedis/
├── backend/                   # API Laravel (produits, commandes, comptes, avis...)
├── frontend/                  # Site Next.js
├── nginx/                     # Configuration du serveur web (développement et production)
├── scripts/                   # Secrets, HTTPS, sauvegarde et restauration
├── docker-compose.yml         # Lancement de tous les services
├── docker-compose.prod.yml    # Compléments pour le serveur de production
├── .env.example               # Modèle de configuration (développement)
└── .env.production.example    # Modèle de configuration (production)
```

## Démarrage sur l'ordinateur (avec Docker)

1. Copier le fichier de configuration :
   ```bash
   cp .env.example .env
   ```
2. Lancer tous les services :
   ```bash
   docker compose up -d --build
   ```
3. Ouvrir :
   - **le site** : http://localhost
   - **le site sans passer par nginx** : http://localhost:3000
   - **l'API** : http://localhost:8000/api/health
   - **Adminer** (consultation de la base) : http://localhost:8080 (système « PostgreSQL », serveur `postgres`)
   - **PostgreSQL** : localhost:5432
   - **Redis** : localhost:6379

Au premier démarrage, la base de données est créée et remplie automatiquement (catégories, produits et
leurs photos), par le script `backend/docker/entrypoint.sh`.

### Comptes administrateur et gestionnaire

Aucun compte d'administration n'est fourni avec le code (pas de mot de passe par défaut).
Créez-les vous-même ; le mot de passe est saisi sans s'afficher à l'écran :

```bash
docker exec -it kpm_backend php artisan kpm:staff                 # administrateur
docker exec -it kpm_backend php artisan kpm:staff --role=manager  # gestionnaire
```

L'espace d'administration (`/admin/connexion`) n'a aucun lien sur le site public.

Pour faire des essais, `SEED_DEMO_DATA=true` dans `.env` ajoute des clients et des commandes fictifs au
premier démarrage (jamais en production).

### Commandes utiles

```bash
# Voir le journal de l'API
docker compose logs -f backend

# Relancer le remplissage de la base (n'écrase pas les produits existants)
docker compose exec backend php artisan db:seed --force

# Ouvrir un terminal dans le conteneur de l'API
docker compose exec backend sh

# Arrêter le site
docker compose down

# Arrêter le site ET effacer toutes les données (base remise à zéro)
docker compose down -v
```

## Développement sans Docker

### API (Laravel)

```bash
cd backend
composer install
cp .env.example .env
# Mettre DB_HOST=127.0.0.1 et REDIS_HOST=127.0.0.1 dans .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve
```

### Site (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Le site appelle l'API à l'adresse `NEXT_PUBLIC_API_URL` (par défaut `http://localhost:8000/api`).

## Mise en ligne (serveur de production)

`docker-compose.prod.yml` complète `docker-compose.yml` pour le serveur :
- mode production : aucun message d'erreur technique montré aux visiteurs ;
- HTTPS (cadenas) avec un certificat Let's Encrypt gratuit ;
- sauvegarde automatique chaque nuit ;
- seul nginx est accessible depuis Internet (ports 80 et 443) : la base, Redis, l'API et Next.js restent
  invisibles de l'extérieur ; Adminer ne démarre qu'à la demande, uniquement depuis le serveur.

**Prérequis** : un serveur Linux (VPS) avec Docker, le nom de domaine **et** `www.` pointant vers l'adresse
IP du serveur, les ports 80 et 443 ouverts.

### Sécuriser le serveur (à faire en premier)

1. **Compte de l'hébergeur** : activer la double authentification (code à 6 chiffres de Google
   Authenticator) dans les paramètres de sécurité du compte. Quiconque prend ce compte peut supprimer le serveur.
2. **Clé SSH**, une seule fois, sur le PC (PowerShell) :
   ```powershell
   ssh-keygen -t ed25519 -C "kamalpharmedis"
   Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
   ```
   Le fichier `id_ed25519` (sans `.pub`) est la clé privée : il ne quitte jamais le PC et n'est jamais envoyé
   à personne. Copier la ligne affichée (clé publique, `ssh-ed25519 AAAA...`) dans le champ « clé SSH » du
   formulaire de commande du VPS, système **Ubuntu 24.04**.
3. **Sécurisation**, à la première connexion (`ssh root@IP`) :
   ```bash
   curl -fsSLO https://raw.githubusercontent.com/Bibalaye7/kamalpharmedis/main/scripts/securiser-serveur.sh
   bash securiser-serveur.sh kpm
   ```
   `scripts/securiser-serveur.sh` crée l'utilisateur administrateur `kpm` (mot de passe demandé pour `sudo`),
   n'accepte plus que la clé SSH (mots de passe et connexion `root` refusés), ferme tous les ports sauf 22, 80
   et 443 (pare-feu UFW), bannit les adresses qui essaient de deviner l'accès (fail2ban : 5 échecs = 1 h,
   récidive = 1 semaine), active les mises à jour de sécurité automatiques et installe Docker. Sans clé SSH en
   place, il s'arrête sans rien modifier.
   **Garder la session ouverte** et vérifier dans une seconde fenêtre que `ssh kpm@IP` fonctionne avant de la fermer.
4. Toutes les commandes suivantes se font ensuite en `kpm` (`ssh kpm@IP`).

### Installer le site

```bash
git clone <adresse du dépôt> kamalpharmedis && cd kamalpharmedis
cp .env.production.example .env
sh scripts/generer-secrets.sh          # crée DB_PASSWORD, APP_KEY, JWT_SECRET (jamais remplacés s'ils existent)
nano .env                              # SITE_DOMAIN, LETSENCRYPT_EMAIL, MAIL_PASSWORD (mot de passe d'application Gmail)
sh scripts/activer-https.sh            # démarre le site et obtient le certificat HTTPS (une seule fois)
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan kpm:staff --role=admin
```

**Mises à jour** du site ensuite :

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Le fichier `.env` du serveur contient les clés secrètes du site : il ne doit jamais être envoyé sur GitHub
(il est exclu par `.gitignore`).

### Serveur PHP

L'API tourne sous **PHP-FPM** : plusieurs demandes traitées en même temps, code PHP gardé en mémoire
(OPcache). Nginx lui transmet les appels `/api/` et envoie lui-même les photos des produits (`/storage/`),
gardées 30 jours par les navigateurs. Réglages : `backend/docker/php/`.

### HTTPS

Le certificat Let's Encrypt est obtenu une seule fois par `scripts/activer-https.sh`, puis renouvelé
automatiquement par le service `certbot` (vérification toutes les 12 heures ; nginx le prend en compte
toutes les 6 heures). Les adresses `http://` et `www.` sont redirigées vers `https://SITE_DOMAIN`.

### Sauvegardes

Le service `sauvegarde` enregistre chaque nuit à 3 h la base de données (`base_*.dump`) et les photos des
produits (`photos_*.tar.gz`) dans le dossier `sauvegardes/` du serveur. Les 14 derniers jours sont gardés.

```bash
# Faire une sauvegarde tout de suite
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec sauvegarde sh /scripts/sauvegarde.sh

# Remettre une sauvegarde (demande confirmation et sauvegarde d'abord l'état actuel)
sh scripts/restaurer.sh sauvegardes/base_2026-10-20_030000.dump
sh scripts/restaurer.sh sauvegardes/photos_2026-10-20_030000.tar.gz
```

Ces sauvegardes restent sur le serveur : en copier régulièrement une sur un autre support (ordinateur,
disque, Google Drive) pour être protégé en cas de perte du serveur, par exemple :

```bash
scp utilisateur@serveur:kamalpharmedis/sauvegardes/* .
```

### Avant l'ouverture au public

- [x] Informations légales (forme juridique, NINEA, RCCM, adresse) dans `frontend/src/lib/legal.ts`.
- [ ] Hébergeur (nom, adresse, site web) dans `frontend/src/lib/legal.ts` : il s'affiche « à compléter » sur la
      page Mentions légales tant qu'il est vide.
- [ ] Mot de passe d'application Gmail recopié dans `MAIL_PASSWORD` du `.env` du serveur (emails de confirmation d'inscription, de mot de
      passe oublié et de suivi de commande).
- [ ] Déclaration du traitement des données personnelles à la CDP (Commission de protection des données
      personnelles du Sénégal).
- [ ] Création du compte administrateur sur le serveur.

## Couleurs du site

| Nom         | Code       |
|-------------|------------|
| Bleu foncé  | `#1A3A8F`  |
| Bleu        | `#2454C7`  |
| Vert        | `#2EA138`  |
| Vert clair  | `#E0F3E5`  |

## Fonctionnalités

- **Site public** : accueil (chiffres réels, vrais avis clients), catalogue avec filtres et recherche avec
  suggestions, fiches produits avec photos, services, contact, demande de devis, pages légales.
- **Commande** : panier, livraison à Dakar et partout au Sénégal (2 000 FCFA, gratuite dès 50 000 FCFA),
  paiement à la livraison (espèces, Wave ou Orange Money au livreur).
- **Espace client** : inscription et connexion, commandes et leur suivi, annulation, favoris, adresses,
  profil, avis sur les produits reçus.
- **Administration** (administrateur et gestionnaire) : statistiques, produits et photos, stock, commandes
  (statuts, paiements), demandes de devis, messages de contact, avis, utilisateurs et rôles (administrateur
  uniquement).
- **Sécurité** : rôles `admin` / `manager` / `client`, session renouvelée automatiquement, limitation des
  tentatives, en-têtes de protection du navigateur, aucune clé secrète dans le code.
