-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "feeti_blog";

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "readTime" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "lead" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_sections" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "paragraphs" TEXT[],

    CONSTRAINT "article_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorials" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "info_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "sections" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "info_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "index" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "accent" TEXT NOT NULL,
    "soft" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "stat" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "quoteAttribution" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_features" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "product_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_steps" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "product_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_position_key" ON "articles"("position");

-- CreateIndex
CREATE INDEX "articles_categorySlug_position_idx" ON "articles"("categorySlug", "position");

-- CreateIndex
CREATE UNIQUE INDEX "article_sections_articleId_position_key" ON "article_sections"("articleId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "tutorials_slug_key" ON "tutorials"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tutorials_position_key" ON "tutorials"("position");

-- CreateIndex
CREATE INDEX "tutorials_level_position_idx" ON "tutorials"("level", "position");

-- CreateIndex
CREATE UNIQUE INDEX "info_pages_slug_key" ON "info_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_position_key" ON "products"("position");

-- CreateIndex
CREATE UNIQUE INDEX "product_features_productId_position_key" ON "product_features"("productId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "product_steps_productId_position_key" ON "product_steps"("productId", "position");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "categories"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_sections" ADD CONSTRAINT "article_sections_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_steps" ADD CONSTRAINT "product_steps_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
