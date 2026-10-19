# KamalPharMédis : le site (Next.js)

Ce dossier contient les pages du site vues par les clients et l'espace d'administration.
Il est construit avec Next.js 14, TypeScript et Tailwind CSS.

Le site ne contient aucune donnée lui-même : produits, commandes et comptes viennent de l'API Laravel
(dossier `backend/`). Pour lancer tout le projet d'un coup avec Docker, voir le README à la racine du dépôt.

## Lancer le site seul, pour développer

```bash
npm install
cp .env.example .env.local
npm run dev
```

Puis ouvrir http://localhost:3000 dans le navigateur. Les pages se mettent à jour à chaque modification
d'un fichier.

L'API doit tourner en même temps : le site l'appelle à l'adresse `NEXT_PUBLIC_API_URL` du fichier `.env.local`
(par défaut `http://localhost:8000/api`).

## Commandes

| Commande        | Rôle                                                       |
|-----------------|------------------------------------------------------------|
| `npm run dev`   | lance le site en mode développement                        |
| `npm run build` | prépare la version optimisée pour la mise en ligne         |
| `npm run start` | lance la version préparée par `npm run build`              |
| `npm run lint`  | vérifie le code (erreurs et mauvaises pratiques)           |

## Organisation des fichiers

```
src/
├── app/           # une page par dossier : catalogue, produits, panier, compte, admin, pages légales...
├── components/    # éléments réutilisés : accueil, catalogue, compte, administration, en-tête, pied de page...
├── context/       # données partagées entre les pages : client connecté, panier
├── lib/           # appels à l'API, livraison, paiement, statuts des commandes, informations légales
└── types/         # description des données (produit, commande, client...)
```

Fichiers à connaître :
- `src/lib/legal.ts` : informations légales de l'entreprise (NINEA, RCCM, forme juridique, hébergeur...).
  Tant qu'elles sont vides, les pages légales affichent « à compléter ».
- `src/lib/api.ts` : appels à l'API depuis le navigateur, avec renouvellement automatique de la session.
- `src/lib/serverApi.ts` : appels à l'API faits par le serveur avant d'envoyer la page.
- `tailwind.config.ts` : couleurs du site (bleu et vert du logo).

## Variables de configuration

| Variable              | Rôle                                                                                     |
|-----------------------|------------------------------------------------------------------------------------------|
| `NEXT_PUBLIC_API_URL` | adresse de l'API utilisée par le navigateur (`/api` en production, derrière nginx)        |
| `INTERNAL_API_URL`    | adresse de l'API utilisée par le serveur Next.js dans Docker (`http://nginx:8000/api`)     |
