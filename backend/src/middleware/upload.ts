import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { BadRequestError } from "../common/errors/http.errors";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(
      `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
    ));
  }
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
}).single("image");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
}).array("images", MAX_FILES);

export const uploadFields = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "gallery", maxCount: 10 },
]);

export function handleMulterError(err: unknown): Error {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return new BadRequestError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      case "LIMIT_FILE_COUNT":
        return new BadRequestError(`Too many files. Maximum is ${MAX_FILES} files`);
      case "LIMIT_UNEXPECTED_FILE":
        return new BadRequestError(`Unexpected field: ${err.field}`);
      default:
        return new BadRequestError(`Upload error: ${err.message}`);
    }
  }
  return err instanceof Error ? err : new Error("Unknown upload error");
}
