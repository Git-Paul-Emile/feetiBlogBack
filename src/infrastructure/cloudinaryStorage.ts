import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

let configured = false;

function configureCloudinary(): void {
  if (configured) return;

  const credentials = new URL(env.CLOUDINARY_URL);
  const apiKey = decodeURIComponent(credentials.username);
  const apiSecret = decodeURIComponent(credentials.password);

  if (credentials.protocol !== "cloudinary:" || !credentials.hostname || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_URL doit contenir des identifiants Cloudinary valides.");
  }

  cloudinary.config({
    cloud_name: credentials.hostname,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

export interface CloudinaryImage {
  publicId: string;
  secureUrl: string;
}

function isCloudinaryImageResult(value: unknown): value is { public_id: string; secure_url: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "public_id" in value &&
    typeof value.public_id === "string" &&
    "secure_url" in value &&
    typeof value.secure_url === "string"
  );
}

function isCloudinaryNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "http_code" in error && error.http_code === 404;
}

async function findCloudinaryImage(publicId: string): Promise<CloudinaryImage | undefined> {
  try {
    const existing: unknown = await cloudinary.api.resource(publicId, { resource_type: "image" });
    if (!isCloudinaryImageResult(existing)) throw new Error("Cloudinary a renvoyé une image invalide.");
    return { publicId: existing.public_id, secureUrl: existing.secure_url };
  } catch (error) {
    if (isCloudinaryNotFound(error)) return undefined;
    throw new Error("Impossible de vérifier une image de seed dans Cloudinary.", { cause: error });
  }
}

export async function uploadRemoteImage(sourceUrl: string, publicId: string): Promise<CloudinaryImage> {
  const source = new URL(sourceUrl);
  if (source.protocol !== "https:") {
    throw new Error("Les images de seed doivent être accessibles en HTTPS.");
  }

  configureCloudinary();
  const existingImage = await findCloudinaryImage(publicId);
  if (existingImage) return existingImage;

  const result = await cloudinary.uploader.upload(sourceUrl, {
    public_id: publicId,
    overwrite: false,
    resource_type: "image",
  });

  return { publicId: result.public_id, secureUrl: result.secure_url };
}
