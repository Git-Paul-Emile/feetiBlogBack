import multer from "multer";
import type { RequestHandler } from "express";
import { ValidationError } from "../errors/ValidationError.js";

const maximumImageSize = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maximumImageSize, files: 1 },
  fileFilter(_request, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ValidationError("Choisissez une image JPG, PNG ou WebP.", []));
      return;
    }
    callback(null, true);
  },
});

function hasValidImageSignature(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg")
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === "image/png")
    return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === "image/webp")
    return buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return false;
}

export const validateArticleImageUpload: RequestHandler = (request, _response, next) => {
  upload.single("image")(request, _response, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      next(new ValidationError("L’image doit peser moins de 5 Mo et un seul fichier peut être envoyé.", []));
      return;
    }
    if (error) {
      next(error);
      return;
    }

    const image = request.file;
    if (!image || !hasValidImageSignature(image.buffer, image.mimetype)) {
      next(new ValidationError("Le fichier envoyé n'est pas une image JPG, PNG ou WebP valide.", []));
      return;
    }
    next();
  });
};
