export interface ArticleSectionDto {
  title: string;
  paragraphs: string[];
}

export interface ArticleDto {
  slug: string;
  category: string;
  read: string;
  title: string;
  excerpt: string;
  lead: string;
  image: string;
  imagePublicId: string;
  sections: ArticleSectionDto[];
}

export interface TutorialDto {
  duration: string;
  level: string;
  title: string;
  description: string;
  image: string;
}

export interface InfoPageDto {
  eyebrow: string;
  title: string;
  intro: string;
  sections: string[];
}

export interface CategoryDto {
  slug: string;
  name: string;
}
