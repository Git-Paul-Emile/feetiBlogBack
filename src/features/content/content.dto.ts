import type { Article, InfoPageContent } from "./content.data.js";
import { tutorials } from "./content.data.js";

export type ArticleDto = Article;
export type TutorialDto = (typeof tutorials)[number];
export type InfoPageDto = InfoPageContent;
