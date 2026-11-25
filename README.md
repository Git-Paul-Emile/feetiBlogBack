# Backend Feeti Blog

API REST autonome en lecture seule. Elle reprend les jeux de données `products` et `content` du frontend, copiés dans `src/features/` et validés au démarrage par les schémas Zod.

Le frontend n'appelle pas cette API. Aucun accès à une base de données ou à Cloudinary n'est configuré. Les URLs d'images reprises dans les mocks restent identiques à celles du frontend jusqu'à la réception des paramètres Cloudinary.

Le build et le typecheck utilisent TypeScript 7. ESLint charge le paquet de compatibilité TypeScript 6 recommandé par Microsoft, car `typescript-eslint` ne prend pas encore en charge l'API de TypeScript 7.

## Démarrer

Depuis `back/` :

```bash
npm install
npm run dev
```

Le serveur écoute sur `http://localhost:3000` par défaut. Les variables disponibles sont listées dans `.env.example`. `CORS_ORIGINS` reste vide tant qu'une origine cliente n'a pas été autorisée. En production, `PUBLIC_BASE_URL` doit être une URL HTTPS. `TRUST_PROXY_HOPS` doit correspondre au nombre de proxys fiables devant le serveur.

## Routes

Toutes les routes sont préfixées par `/api/v1`.

| Méthode | Route                     | Réponse                                       |
| ------- | ------------------------- | --------------------------------------------- |
| GET     | `/health`                 | disponibilité de l'API mock                   |
| GET     | `/products`               | produits paginés, filtrables par `slug`       |
| GET     | `/products/:slug`         | produit par slug                              |
| GET     | `/content/articles`       | articles paginés, filtrables par `category`   |
| GET     | `/content/articles/:slug` | article par slug                              |
| GET     | `/content/tutorials`      | tutoriels paginés, filtrables par `level`     |
| GET     | `/content/pages/:slug`    | page d'information par slug                   |
| GET     | `/openapi.json`           | contrat OpenAPI généré depuis les schémas Zod |

Les routes de collection acceptent `page`, `limit` (maximum 100), `search` et `sort`. Les erreurs et les succès utilisent une enveloppe JSON stable.

## Données et intégrations futures

Les repositories mockés sont la seule source de données des services. Le choix du fournisseur de base serverless et les connexions restent en attente des URLs fournies. Les images sont des champs URL simples; aucun SDK ni secret Cloudinary n'est nécessaire pour servir les mocks.
