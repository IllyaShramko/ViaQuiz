import type { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import { BadRequestError, InternalServerError } from "../errors/customErrors";
import { processAndUploadImage, type UploadImageOptions } from "../tools/uploader";

export interface UploadMiddlewareOptions extends UploadImageOptions {
	fieldName?: string;
	required?: boolean;
	maxSizeMb?: number;
	allowedMimeTypes?: string[];
}

const DEFAULT_ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/avif",
];

/**
 * Creates an Express middleware for handling image uploads.
 * Flow:
 * 1. Multer parses multipart/form-data into memory.
 * 2. Sharp optimizes, resizes and converts the image to WebP.
 * 3. Uploads the processed image buffer to Cloudinary.
 * 4. Injects `secure_url` into `res.locals.uploadedUrl` and `req.file.path`.
 */
export function uploadImage(options: UploadMiddlewareOptions = {}) {
	const {
		fieldName = "image",
		required = true,
		maxSizeMb = 5,
		allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
		folder = "viaquiz",
		maxWidth = 1920,
		maxHeight = 1080,
		quality = 80,
		format = "webp",
	} = options;

	const upload = multer({
		storage: multer.memoryStorage(),
		limits: {
			fileSize: maxSizeMb * 1024 * 1024,
		},
		fileFilter: (_req, file, cb) => {
			if (!allowedMimeTypes.includes(file.mimetype)) {
				return cb(
					new BadRequestError(
						`Invalid file type (${file.mimetype}). Allowed types: ${allowedMimeTypes.join(", ")}`,
					),
				);
			}
			cb(null, true);
		},
	}).single(fieldName);

	return (req: Request, res: Response, next: NextFunction) => {
		upload(req, res, async (err) => {
			if (err) {
				if (err instanceof MulterError) {
					if (err.code === "LIMIT_FILE_SIZE") {
						return next(
							new BadRequestError(
								`File size exceeds maximum allowed limit of ${maxSizeMb}MB`,
							),
						);
					}
					return next(new BadRequestError(`File upload error: ${err.message}`));
				}
				return next(err);
			}

			if (!req.file) {
				if (required) {
					return next(new BadRequestError(`Field '${fieldName}' is required`));
				}
				return next();
			}

			try {
				const uploadResult = await processAndUploadImage(req.file.buffer, {
					folder,
					maxWidth,
					maxHeight,
					quality,
					format,
				});

				// Attach Cloudinary URL & metadata to locals and request object
				res.locals.uploadedUrl = uploadResult.secure_url;
				res.locals.uploadedPublicId = uploadResult.public_id;
				req.file.path = uploadResult.secure_url;
				(req as Request & { uploadedUrl?: string }).uploadedUrl = uploadResult.secure_url;

				next();
			} catch (error) {
				next(
					new InternalServerError(
						"Failed to process and upload image to Cloudinary",
						error instanceof Error ? error.message : error,
					),
				);
			}
		});
	};
}
