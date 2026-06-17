import { Router } from "express";
import { uploadController } from "./upload.controller";
import { requireAuth, requireManager } from "../../middleware";

const router = Router();

router.post(
  "/property-image",
  requireAuth,
  requireManager,
  uploadController.uploadPropertyImage.bind(uploadController)
);

router.post(
  "/room-type-image",
  requireAuth,
  requireManager,
  uploadController.uploadRoomTypeImage.bind(uploadController)
);

router.post(
  "/guest-image",
  requireAuth,
  uploadController.uploadGuestImage.bind(uploadController)
);

router.post(
  "/images",
  requireAuth,
  requireManager,
  uploadController.uploadMultipleImages.bind(uploadController)
);

router.delete(
  "/images/:publicId",
  requireAuth,
  requireManager,
  uploadController.deleteImageByPublicId.bind(uploadController)
);

export default router;
