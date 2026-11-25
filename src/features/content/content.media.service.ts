import { uploadArticleImage } from "../../infrastructure/cloudinaryStorage.js";

export async function storeArticleImage(buffer: Buffer, mimeType: string) {
  return uploadArticleImage(buffer, mimeType);
}
