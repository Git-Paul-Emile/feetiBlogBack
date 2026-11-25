# Backend FeetiBlog

API REST de lecture autonome. Le front conserve ses mocks et n'appelle pas cette API.
Le backend stocke ses contenus dans le schéma PostgreSQL `feeti_blog`, sur la même
instance que FeetiTicket, sans utiliser les tables de billetterie. Les images des seeds
sont envoyées dans le dossier Cloudinary `feeti-blog/`.

## Configuration

Copier les variables `DATABASE_URL`, `DIRECT_URL` et `CLOUDINARY_URL` de FeetiTicket
dans `.env`, puis ajouter `schema=feeti_blog` aux paramètres de requête des deux URLs
PostgreSQL. Ne pas committer `.env`. Les noms des variables et des exemples sont dans
`.env.example`.

En production, définir également `NODE_ENV=production` et `PUBLIC_BASE_URL` avec l'URL
HTTPS du service. `render.yaml` décrit les commandes de build, migration, démarrage et
health check. Les trois variables secrètes doivent être renseignées dans l'environnement
Render.

## Migration et données initiales

```bash
npm install
npm run build
npm run db:migrate:deploy
npm run db:seed
```

La migration crée uniquement le schéma `feeti_blog`. Le seed est réexécutable : il met à
jour ses catégories, articles, tutoriels, pages et produits sans supprimer d'autres
données. Il transfère les images des mocks vers des identifiants stables sous
`feeti-blog/` dans Cloudinary, puis enregistre leurs URLs sécurisées en base.

Sur Render, le démarrage applique les migrations. Exécuter `npm run db:seed` une fois
depuis le shell du service après avoir configuré les variables d'environnement.

## Routes

Toutes les routes utilisent le préfixe `/api/v1`.

| Méthode | Route                     | Réponse                                       |
| ------- | ------------------------- | --------------------------------------------- |
| GET     | `/health`                 | disponibilité de l'API et de PostgreSQL       |
| GET     | `/products`               | produits paginés, filtrables par `slug`       |
| GET     | `/products/:slug`         | produit par slug                              |
| GET     | `/content/articles`       | articles paginés, filtrables par `category`   |
| GET     | `/content/articles/:slug` | article par slug                              |
| GET     | `/content/tutorials`      | tutoriels paginés, filtrables par `level`     |
| GET     | `/content/pages/:slug`    | page d'information par slug                   |
| GET     | `/openapi.json`           | contrat OpenAPI généré depuis les schémas Zod |
