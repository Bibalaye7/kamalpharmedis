# KamalPharMédis

Plateforme e-commerce de vente de matériel médical et de promotion des médicaments et produits de santé.

## Stack technique

| Composant       | Technologie                          |
|-----------------|---------------------------------------|
| Frontend        | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend         | Laravel 11 (API REST) + JWT (php-open-source-saver/jwt-auth) |
| Base de données | PostgreSQL 16                         |
| Cache           | Redis 7                               |
| Reverse proxy   | Nginx                                 |
| Admin BDD       | Adminer                               |

## Structure du projet

```
kamalpharmedis/
├── backend/          # API Laravel 11
├── frontend/          # Application Next.js 14
├── nginx/              # Configuration du reverse proxy
├── docker-compose.yml
└── .env.example       # Variables pour docker-compose
```

## Démarrage avec Docker (recommandé)

1. Copier le fichier d'environnement racine :
   ```bash
   cp .env.example .env
   ```
2. Lancer l'ensemble des services :
   ```bash
   docker compose up -d --build
   ```
3. Accéder à l'application :
   - **Site public** : http://localhost (via Nginx)
   - **Frontend direct** : http://localhost:3000
   - **API backend** : http://localhost:8000/api/health
   - **Adminer** : http://localhost:8080 (système « PostgreSQL », serveur `postgres`)
   - **PostgreSQL** : localhost:5432
   - **Redis** : localhost:6379

Au premier démarrage, le conteneur `backend` exécute automatiquement les migrations et les seeders (données de démonstration) via `docker/entrypoint.sh`.

### Comptes administrateur et gestionnaire

Aucun compte d'administration n'est livré avec le code (pas d'identifiants par défaut).
Créez-les vous-même ; le mot de passe est saisi de façon masquée :

```bash
docker exec -it kpm_backend php artisan kpm:staff                 # administrateur
docker exec -it kpm_backend php artisan kpm:staff --role=manager  # gestionnaire
```

Le portail d'administration (`/admin/connexion`) n'est lié nulle part sur le site public.

Pour un environnement de développement, `SEED_DEMO_DATA=true` ajoute des clients et commandes fictifs au premier démarrage.

### Commandes utiles

```bash
# Voir les logs
docker compose logs -f backend

# Relancer les seeders manuellement
docker compose exec backend php artisan db:seed --force

# Ouvrir un shell dans le backend
docker compose exec backend sh

# Arrêter les services
docker compose down

# Arrêter et supprimer les volumes (réinitialise la base de données)
docker compose down -v
```

## Développement local (sans Docker)

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
# Adapter DB_HOST=127.0.0.1 et REDIS_HOST=127.0.0.1 dans .env pour un usage hors Docker
php artisan key:generate
php artisan jwt:secret
php artisan migrate --seed
php artisan serve
```

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Le frontend attend l'API sur `NEXT_PUBLIC_API_URL` (par défaut `http://localhost:8000/api`).

## Mise en production (serveur)

`docker-compose.prod.yml` s'ajoute à `docker-compose.yml` : mode production (debug désactivé), seul nginx
est exposé sur Internet, Adminer ne démarre qu'à la demande et uniquement en local sur le serveur.

```bash
cp .env.production.example .env
sh scripts/generer-secrets.sh          # DB_PASSWORD, APP_KEY, JWT_SECRET (jamais remplacés s'ils existent)
nano .env                              # SITE_URL, MAIL_PASSWORD (mot de passe d'application Gmail)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan kpm:staff --role=admin
```

Avant l'ouverture au public : compléter les informations légales (NINEA, RCCM, forme juridique, hébergeur,
responsable de la publication) dans `frontend/src/lib/legal.ts`. Elles s'affichent « à compléter » sur les pages
Mentions légales, Conditions de vente, Confidentialité et Cookies tant qu'elles sont vides.

## Palette de couleurs

| Nom         | Code       |
|-------------|------------|
| Blue Deep   | `#1A3A8F`  |
| Blue Main   | `#2454C7`  |
| Green Main  | `#2EA138`  |
| Green Pale  | `#E0F3E5`  |

## Fonctionnalités principales

- **Public** : accueil, catalogue filtrable, fiche produit, services, contact.
- **Espace client** : inscription/connexion (JWT), tableau de bord, commandes, favoris, adresses, profil.
- **Panel admin/manager** : statistiques, CRUD produits (avec images), gestion des commandes (statuts, paiement), gestion des utilisateurs et rôles (admin uniquement).
- **API** : rôles `admin` / `manager` / `client` via middleware dédié, panier persistant en base, gestion transactionnelle du stock à la commande, cache Redis sur le catalogue.
