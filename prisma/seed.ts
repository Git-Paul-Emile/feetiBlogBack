import { articles, infoPages, tutorials } from "../src/features/content/content.data.js";
import { products } from "../src/features/products/products.data.js";
import { prisma } from "../src/lib/prisma.js";
import { uploadRemoteImage, type CloudinaryImage } from "../src/infrastructure/cloudinaryStorage.js";
import { logger } from "../src/lib/logger.js";

interface SeedImageSource {
  sourceUrl: string;
  publicId: string;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function collectImageSources(): SeedImageSource[] {
  return [
    ...products.map(({ slug, image }) => ({ sourceUrl: image, publicId: `feeti-blog/products/${slug}` })),
    ...articles.map(({ slug, image }) => ({ sourceUrl: image, publicId: `feeti-blog/articles/${slug}` })),
    ...tutorials.map(({ title, image }) => ({
      sourceUrl: image,
      publicId: `feeti-blog/tutorials/${slugify(title)}`,
    })),
  ];
}

async function uploadSeedImages(): Promise<Map<string, CloudinaryImage>> {
  const images = new Map<string, CloudinaryImage>();

  for (const source of collectImageSources()) {
    if (images.has(source.sourceUrl)) continue;
    images.set(source.sourceUrl, await uploadRemoteImage(source.sourceUrl, source.publicId));
  }

  return images;
}

function getImage(images: Map<string, CloudinaryImage>, sourceUrl: string): CloudinaryImage {
  const image = images.get(sourceUrl);
  if (!image) throw new Error("Une image de seed n'a pas été transférée vers Cloudinary.");
  return image;
}

async function seedDatabase(images: Map<string, CloudinaryImage>): Promise<void> {
  await prisma.$transaction(
    async (transaction) => {
      const categories = [...new Set(articles.map(({ category }) => category))].map((name) => ({
        name,
        slug: slugify(name),
      }));

      for (const category of categories) {
        await transaction.blogCategory.upsert({
          where: { slug: category.slug },
          create: category,
          update: { name: category.name },
        });
      }

      for (const [position, article] of articles.entries()) {
        const image = getImage(images, article.image);
        const fields = {
          position,
          categorySlug: slugify(article.category),
          readTime: article.read,
          title: article.title,
          excerpt: article.excerpt,
          lead: article.lead,
          imageUrl: image.secureUrl,
          imagePublicId: image.publicId,
        };
        const sections = article.sections.map((section, sectionPosition) => ({
          position: sectionPosition,
          title: section.title,
          paragraphs: section.paragraphs,
        }));

        await transaction.blogArticle.upsert({
          where: { slug: article.slug },
          create: { ...fields, slug: article.slug, sections: { create: sections } },
          update: { ...fields, sections: { deleteMany: {}, create: sections } },
        });
      }

      for (const [position, tutorial] of tutorials.entries()) {
        const image = getImage(images, tutorial.image);
        const slug = slugify(tutorial.title);
        await transaction.blogTutorial.upsert({
          where: { slug },
          create: {
            slug,
            position,
            duration: tutorial.duration,
            level: tutorial.level,
            title: tutorial.title,
            description: tutorial.description,
            imageUrl: image.secureUrl,
            imagePublicId: image.publicId,
          },
          update: {
            position,
            duration: tutorial.duration,
            level: tutorial.level,
            title: tutorial.title,
            description: tutorial.description,
            imageUrl: image.secureUrl,
            imagePublicId: image.publicId,
          },
        });
      }

      for (const [slug, page] of Object.entries(infoPages)) {
        await transaction.blogInfoPage.upsert({
          where: { slug },
          create: { slug, ...page },
          update: page,
        });
      }

      for (const [position, product] of products.entries()) {
        const image = getImage(images, product.image);
        const fields = {
          position,
          indexLabel: product.index,
          name: product.name,
          eyebrow: product.eyebrow,
          title: product.title,
          description: product.description,
          accent: product.accent,
          soft: product.soft,
          imageUrl: image.secureUrl,
          imageAlt: product.imageAlt,
          imagePublicId: image.publicId,
          stat: product.stat,
          outcome: product.outcome,
          quote: product.quote,
          quoteAttribution: product.quoteAttribution,
          cta: product.cta,
          contact: product.contact,
        };
        const features = product.features.map((feature, featurePosition) => ({
          ...feature,
          position: featurePosition,
        }));
        const steps = product.steps.map((step, stepPosition) => ({ ...step, position: stepPosition }));

        await transaction.blogProduct.upsert({
          where: { slug: product.slug },
          create: {
            ...fields,
            slug: product.slug,
            features: { create: features },
            steps: { create: steps },
          },
          update: {
            ...fields,
            features: { deleteMany: {}, create: features },
            steps: { deleteMany: {}, create: steps },
          },
        });
      }
    },
    { maxWait: 10_000, timeout: 60_000 },
  );
}

function getPrismaErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

function getPrismaModelName(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("meta" in error)) return undefined;
  const metadata = error.meta;
  if (typeof metadata !== "object" || metadata === null || !("modelName" in metadata)) return undefined;
  return typeof metadata.modelName === "string" ? metadata.modelName : undefined;
}

async function seed(): Promise<void> {
  try {
    const images = await uploadSeedImages();
    await seedDatabase(images);
    logger.info("blog_seed_complete", {
      categories: new Set(articles.map(({ category }) => category)).size,
      articles: articles.length,
      tutorials: tutorials.length,
      pages: Object.keys(infoPages).length,
      products: products.length,
      cloudinaryImages: images.size,
    });
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    logger.error("blog_seed_failed", {
      errorName,
      errorCode: getPrismaErrorCode(error),
      modelName: getPrismaModelName(error),
    });
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void seed();
