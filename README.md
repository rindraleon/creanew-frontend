# CreaNew — frontend

Application React, TypeScript et Vite. Prérequis : Node.js 22, npm et le backend CreaNew en fonctionnement.

## Installation et démarrage

```sh
npm ci
cp .env.example .env
npm run dev
```

Ouvrir `http://localhost:5173`. Par défaut, le proxy transmet `/api` au backend sur `http://localhost:3000`. Modifier `VITE_PROXY_TARGET` dans `.env` si nécessaire. Garder `VITE_API_URL=/api` pour une connexion par proxy de même origine ; les variables `VITE_*` sont publiques et ne doivent contenir aucun secret.

## Commandes utiles

```sh
npm run dev          # serveur de développement
npm run build        # compilation dans dist/
npm run preview      # aperçu du build local
npm run lint         # contrôler le code
npm run typecheck    # vérifier les types
npm run format:check # vérifier le format
npm run format       # formater le code
npm audit --audit-level=high
```

Les routes principales sont `/`, `/boutique`, `/connexion` et `/inscription`. Les vues d'authentification sont autonomes, sans fil d’Ariane ; la bascule animée relie les deux formulaires. La création d'un compte client est gratuite et ne nécessite pas de validation des conditions générales. La demande de compte vendeur reste soumise à l'approbation de l'administrateur. Aucun lien de confirmation d'e-mail n'est requis ; le mot de passe oublié nécessite un SMTP fonctionnel.

## Composants et styles

Le projet comprend TypeScript, Tailwind, `lucide-react` et la configuration shadcn/ui. Les composants sont dans `src/components/ui`, dont `auth-switch.tsx`, son style local `auth-switch.css` et `demo.tsx`, utilisé par la page de connexion ; les styles globaux sont dans `src/index.css`. L'alias `@/components/ui` pointe vers ce dossier : il n'est donc pas nécessaire de créer un autre dossier `/components/ui` à la racine. L'authentification utilise les fournisseurs React déjà déclarés dans `src/app/providers.tsx`, le routeur et le backend réels.

La configuration CLI est dans `components.json` ; `src/lib/utils.ts` fournit `cn`. Pour examiner l'ajout d'un composant shadcn sans modifier le projet, lancer `npx shadcn@latest add button --dry-run` depuis `frontend`. Retirer `--dry-run` seulement après revue. Le dépôt comporte déjà un `Button.tsx` métier : attention à la casse et aux collisions sur les systèmes de fichiers insensibles à la casse. Aucune image externe n'est nécessaire pour le panneau d'authentification.

## Architecture

```text
src/
├── app/                   # démarrage, routes et fournisseurs
├── components/            # composants partagés
├── features/              # pages, formulaires et API par domaine
├── layouts/               # espaces public, client, vendeur et admin
├── shared/                # client HTTP, types, hooks et validations
├── styles/                # polices et styles complémentaires
└── index.css              # styles globaux
public/                    # logo, images, polices et ressources statiques
.github/                   # CI et configuration de déploiement
Dockerfile, nginx.conf     # image et proxy de production
```

Configuration Render : [docs/DEPLOY_RENDER.md](docs/DEPLOY_RENDER.md).
