import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import streamifier from "streamifier";
import { env } from "../config/env";
import { logger } from "./logger";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export type ImageFolder = "properties" | "room-types" | "guests" | "general";

const FOLDER_PREFIX = "guesthouse";

let isConfigured = false;

function configureCloudinary(): boolean {
  if (isConfigured) return true;

  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn("Cloudinary not configured - missing credentials");
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
  logger.info("Cloudinary configured");
  return true;
}

export function isCloudinaryConfigured(): boolean {
  return configureCloudinary();
}

export async function uploadImage(
  buffer: Buffer,
  folder: ImageFolder,
  options: {
    publicId?: string;
    transformation?: Record<string, unknown>;
  } = {}
): Promise<UploadResult> {
  if (!configureCloudinary()) {
    throw new Error("Cloudinary is not configured");
  }

  const fullFolder = `${FOLDER_PREFIX}/${folder}`;

  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: fullFolder,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: options.transformation || [
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
      uploadOptions.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          logger.error({ err: error }, "Cloudinary upload failed");
          reject(new Error(`Upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error("Upload failed: No result returned"));
          return;
        }

        logger.info({ publicId: result.public_id, folder: fullFolder }, "Image uploaded to Cloudinary");

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function uploadImageWithResize(
  buffer: Buffer,
  folder: ImageFolder,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<UploadResult> {
  return uploadImage(buffer, folder, {
    transformation: [
      { width: maxWidth, height: maxHeight, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });
}

export async function uploadThumbnail(
  buffer: Buffer,
  folder: ImageFolder,
  width: number = 300,
  height: number = 300
): Promise<UploadResult> {
  return uploadImage(buffer, folder, {
    transformation: [
      { width, height, crop: "fill", gravity: "auto" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });
}

export async function deleteImage(publicId: string): Promise<boolean> {
  if (!configureCloudinary()) {
    throw new Error("Cloudinary is not configured");
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      logger.info({ publicId }, "Image deleted from Cloudinary");
      return true;
    }

    if (result.result === "not found") {
      logger.warn({ publicId }, "Image not found in Cloudinary");
      return false;
    }

    logger.warn({ publicId, result }, "Unexpected Cloudinary delete result");
    return false;
  } catch (error) {
    logger.error({ err: error, publicId }, "Cloudinary delete failed");
    throw error;
  }
}

export async function deleteImages(publicIds: string[]): Promise<{ deleted: string[]; failed: string[] }> {
  if (!configureCloudinary()) {
    throw new Error("Cloudinary is not configured");
  }

  if (publicIds.length === 0) {
    return { deleted: [], failed: [] };
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds);

    const deleted: string[] = [];
    const failed: string[] = [];

    for (const [publicId, status] of Object.entries(result.deleted || {})) {
      if (status === "deleted") {
        deleted.push(publicId);
      } else {
        failed.push(publicId);
      }
    }

    logger.info({ deletedCount: deleted.length, failedCount: failed.length }, "Bulk delete completed");

    return { deleted, failed };
  } catch (error) {
    logger.error({ err: error, publicIds }, "Cloudinary bulk delete failed");
    throw error;
  }
}

export function getImageUrl(publicId: string, options: {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
} = {}): string {
  if (!configureCloudinary()) {
    return "";
  }

  const transformations: Record<string, unknown>[] = [];

  if (options.width || options.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: options.crop || "fill",
    });
  }

  transformations.push({
    quality: options.quality || "auto:good",
    fetch_format: "auto",
  });

  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
}
