import { Router } from "express";
import { UploadController } from "./upload.controller";
import { authenticate } from "../../middlewares/authMiddleware";
import { uploadImage } from "../../middlewares/uploadMiddleware";

export const uploadRouter: Router = Router();

/**
 * POST /api/upload/image
 * Accepts multipart/form-data with field 'image'.
 * Processes via Sharp (resize, optimize to WebP) and uploads to Cloudinary.
 * Returns { success: true, data: { url: "https://...", publicId: "..." } }
 */
uploadRouter.post(
	"/image",
	authenticate,
	uploadImage({
		fieldName: "image",
		folder: "viaquiz",
		maxSizeMb: 5,
		maxWidth: 1920,
		maxHeight: 1080,
		quality: 80,
	}),
	UploadController.uploadImage,
);
