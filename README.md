# MobilierShop — Frontend (React 18 + Vite 5 + TypeScript strict + Tailwind 3)

Boutique en ligne de mobilier livrée à Antananarivo. Toutes les données viennent de
l'API NestJS (`../backend`) : **aucune donnée n'est simulée ni stockée dans le
navigateur**. Le panier, les favoris et la session sont persistés côté serveur.

## Démarrage

```bash
npm install
npm run dev        # http://localhost:5173 (proxy /api → http://localhost:3000)
npm run typecheck  # tsc --noEmit (mode strict)
npm run lint
npm run test       # vitest
npm run build      # tsc --noEmit && vite build
npm run sitemap    # régénère public/sitemap.xml depuis l'API
npm run images     # régénère les variantes WebP de public/images
```

Le backend doit tourner (voir `../backend/README.md`). Sans lui, l'application
affiche des états d'erreur explicites plutôt que des données factices.

## Comptes de démonstration

Ces comptes sont créés par `npm run seed` dans le backend (mot de passe
`Motdepasse1!` pour tous) :

| Rôle             | Email                 | Peut faire                                     |
| ---------------- | --------------------- | ---------------------------------------------- |
| Administrateur   | `admin@example.local` | tout, y compris `/admin`                       |
| Vendeur          | `seller@example.local` | publier et vendre (statut `approved`)          |
| Vendeur (en attente) | `pending@example.local` | voit un écran « demande en cours de validation » |
| Client           | `customer@example.local` | commander, payer par Mobile Money             |

## Architecture

- **React Router 6** — trois arbres de routes séparés par `SpaceBoundary` :
  public, `/espace-client`, `/vendeur` (boutique **approuvée**), `/admin`.
  Les espaces vendeur et administrateur sont chargés en `lazy`.
- **TanStack Query 5** — état serveur, cache, retry, invalidation. `src/hooks/useCatalog.ts`
  expose `useProducts(query, options)` avec un paramètre `enabled` : la recherche ne
  part jamais tant que l'utilisateur n'a pas saisi 2 caractères (l'API rejette `limit: 0`).
- **React Hook Form + Zod** — validation côté client, miroir de la validation
  class-validator du backend. Les messages d'erreur s'affichent sous le champ concerné.
- **`src/lib/api/`** — un client par domaine, jeton d'accès en mémoire, rafraîchissement
  par cookie `httpOnly`, `Idempotency-Key` sur les écritures, timeout + annulation.
- **Accessibilité** — `useFocusTrap` sur tous les dialogues (Échap, cycle `Tab`,
  focus initial), `useSeo` pour les métadonnées de chaque page.

## Parcours réels couverts

1. Connexion → catalogue → fiche produit → panier
2. Commande : adresse du carnet **présélectionnée** (ou nouvelle adresse), frais de
   port calculés par le serveur
3. Paiement Mobile Money : saisie d'une référence, **vérification manuelle** par
   l'équipe — jamais de validation automatique
4. Suivi de commande, notifications, favoris, carnet d'adresses

## Pages de contenu

`/livraison-retours`, `/conditions-generales`, `/confidentialite` sont de vraies
pages (gabarit `src/components/ui/StaticContentPage.tsx`), pas des liens morts.

## Images et polices

**Images.** `src/components/ui/ResponsiveImage.tsx` rend un `<picture>` : le
navigateur choisit la variante WebP la plus petite qui convient et retombe sur
le JPEG d'origine si besoin. `sizes` décrit la place réelle de l'image dans la
page — sans lui, le navigateur suppose `100vw` et télécharge toujours la plus
grande variante. Les variantes sont produites par :

```bash
npm run images    # sharp → public/images/*-{480,960,1600}.webp
```

**Polices.** Auto-hébergées dans `public/fonts` (96 Ko) et déclarées dans
`src/styles/fonts.css`. Hanken Grotesk est une police variable : un seul fichier
couvre les graisses 100–900. Aucune requête vers Google Fonts.

## Scripts utiles

```bash
npm run sitemap   # 23 URL (statiques + produits publiés) — à relancer après publication
npm run images    # variantes WebP — à relancer après ajout d'un visuel
```

`public/robots.txt` interdit l'indexation des espaces privés et des pages de
boutique filtrées (`?q=`, `?page=`).
