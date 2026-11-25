# Retour arrière

Cette migration ajoute les tables de comptes administrateur, sessions et jetons de
confirmation. Elle ne modifie pas les articles existants, sauf l'ajout d'une valeur par
défaut vide sur leurs colonnes d'image. Les migrations Prisma du projet ne portent pas de
script descendant. Pour annuler cette évolution, sauvegarder la base, supprimer d'abord
les nouvelles tables (cela efface comptes, sessions et jetons), puis retirer les valeurs
par défaut :

```sql
DROP TABLE "feeti_blog"."admin_email_verification_tokens";
DROP TABLE "feeti_blog"."admin_sessions";
DROP TABLE "feeti_blog"."admin_users";
ALTER TABLE "feeti_blog"."articles"
  ALTER COLUMN "imageUrl" DROP DEFAULT,
  ALTER COLUMN "imagePublicId" DROP DEFAULT;
```
