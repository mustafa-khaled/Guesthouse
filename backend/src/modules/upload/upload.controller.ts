import { Request, Response, NextFunction } from "express";
import {
  uploadImage,
  uploadImageWithResize,
  deleteImage,
  isCloudinaryConfigured,
  ImageFolder,
} from "../../lib/cloudinary";
import { uploadSingle, uploadMultiple, handleMulterError } from "../../middleware/upload";
import { BadRequestError } from "../../common/errors/http.errors";

class UploadController {
  async uploadPropertyImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.handleUpload(req, res, next, "properties");
  }

  async uploadRoomTypeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.handleUpload(req, res, next, "room-types");
  }

  async uploadGuestImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.handleUpload(req, res, next, "guests");
  }

  async uploadGeneralImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    this.handleUpload(req, res, next, "general");
  }

  async uploadMultipleImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isCloudinaryConfigured()) {
        throw new BadRequestError("Image upload service is not configured");
      }

      await new Promise<void>((resolve, reject) => {
        uploadMultiple(req, res, (err) => {
          if (err) reject(handleMulterError(err));
          else resolve();
        });
      });

      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        throw new BadRequestError("No images provided");
      }

      const folder = (req.query.folder as ImageFolder) || "general";
      const validFolders: ImageFolder[] = ["properties", "room-types", "guests", "general"];
      
      if (!validFolders.includes(folder)) {
        throw new BadRequestError(`Invalid folder. Must be one of: ${validFolders.join(", ")}`);
      }

      const uploadPromises = files.map((file) =>
        uploadImageWithResize(file.buffer, folder)
      );

      const results = await Promise.all(uploadPromises);

      res.status(201).json({
        message: `${results.length} images uploaded successfully`,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteImageByPublicId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!isCloudinaryConfigured()) {
        throw new BadRequestError("Image upload service is not configured");
      }

      const { publicId } = req.params as { publicId: string };

      if (!publicId) {
        throw new BadRequestError("Public ID is required");
      }

      const decodedPublicId = decodeURIComponent(publicId);

      if (!decodedPublicId.startsWith("guesthouse/")) {
        throw new BadRequestError("Invalid public ID - can only delete guesthouse images");
      }

      const deleted = await deleteImage(decodedPublicId);

      if (deleted) {
        res.json({ message: "Image deleted successfully" });
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    } catch (error) {
      next(error);
    }
  }

  private async handleUpload(
    req: Request,
    res: Response,
    next: NextFunction,
    folder: ImageFolder
  ): Promise<void> {
    try {
      if (!isCloudinaryConfigured()) {
        throw new BadRequestError("Image upload service is not configured");
      }

      await new Promise<void>((resolve, reject) => {
        uploadSingle(req, res, (err) => {
          if (err) reject(handleMulterError(err));
          else resolve();
        });
      });

      if (!req.file) {
        throw new BadRequestError("No image provided");
      }

      const result = await uploadImageWithResize(req.file.buffer, folder);

      res.status(201).json({
        message: "Image uploaded successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
