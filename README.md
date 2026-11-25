# Backend FeetiBlog

API REST de Feeti Blog. Le frontend lit les contenus persistés et envoie les opérations
d'administration à cette API.
Le backend stocke ses contenus dans le schéma PostgreSQL `feeti_blog`, sur la même
instance que FeetiTicket, sans utiliser les tables de billetterie. Les images des seeds
sont envoyées dans le dossier Cloudinary `feeti-blog/`.

## Configuration

Copier les variables `DATABASE_URL`, `DIRECT_URL` et `CLOUDINARY_URL` de FeetiTicket
dans `.env`, puis ajouter `schema=feeti_blog` aux paramètres de requête des deux URLs
PostgreSQL. Ne pas committer `.env`. Les noms des variables et des exemples sont dans
`.env.example`.

En production, définir `NODE_ENV=production`. Sur Render, `PUBLIC_BASE_URL` utilise
automatiquement `RENDER_EXTERNAL_URL`; ailleurs, fournir cette variable avec l'URL HTTPS
publique. `render.yaml` décrit les commandes de build, migration, démarrage et health
check. Renseigner aussi dans Render `ADMIN_REGISTRATION_SECRET` (au moins 32 caractères),
`RESEND_API_KEY` et `EMAIL_FROM` avec une adresse validée dans Resend. La route
`/inscription` crée uniquement des comptes administrateurs, avec code d'invitation et
confirmation e-mail. Sans ces variables, l'inscription reste fermée.

Le front utilise `https://feetiblogfront.vercel.app` comme origine autorisée. Le fichier
`front/vercel.json` relaie `/api/v1/*` vers le service Render pour conserver le cookie de
session sur le même domaine que le front. Si l'URL publique du service Render diffère du
nom `feeti-blog-backend`, mettre à jour la destination de ce rewrite.

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

| Méthode | Route                       | Réponse                                                |
| ------- | --------------------------- | ------------------------------------------------------ |
| GET     | `/health`                   | disponibilité de l'API et de PostgreSQL                |
| GET     | `/products`                 | produits paginés, filtrables par `slug`                |
| GET     | `/products/:slug`           | produit par slug                                       |
| GET     | `/content/articles`         | articles paginés, filtrables par `category`            |
| GET     | `/content/articles/:slug`   | article par slug                                       |
| GET     | `/content/categories`       | catégories paginées                                    |
| POST    | `/content/images`           | import d'image JPG, PNG ou WebP dans Cloudinary, admin |
| POST    | `/content/articles`         | créer un article, admin                                |
| PUT     | `/content/articles/:slug`   | remplacer un article, admin                            |
| DELETE  | `/content/articles/:slug`   | supprimer un article, admin                            |
| GET     | `/content/tutorials`        | tutoriels paginés, filtrables par `level`              |
| GET     | `/content/pages/:slug`      | page d'information par slug                            |
| POST    | `/auth/admin-registrations` | demander une inscription administrateur                |
| POST    | `/auth/email-verifications` | confirmer l'e-mail et ouvrir une session               |
| POST    | `/auth/sessions`            | connexion administrateur                               |
| GET     | `/auth/session`             | lire la session active                                 |
| DELETE  | `/auth/session`             | fermer la session                                      |
| GET     | `/openapi.json`             | contrat OpenAPI généré depuis les schémas Zod          |

Les mutations d'articles et l'import d'images vérifient le cookie HttpOnly côté serveur.
Les mots de passe sont hachés avec bcrypt, les jetons de session et de confirmation ne
sont stockés qu'en empreinte. Chaque mutation exige aussi une origine front autorisée.
