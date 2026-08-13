import sharp from "sharp";
import { cloudinary } from "../config/cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { logger } from "./logger";

export interface ProcessImageOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: "webp" | "jpeg" | "png";
}

export interface UploadImageOptions extends ProcessImageOptions {
	folder?: string;
}

/**
 * Optimizes an image buffer using Sharp and uploads it to Cloudinary.
 * Returns the full Cloudinary UploadApiResponse including secure_url and public_id.
 */
export async function processAndUploadImage(
	buffer: Buffer,
	options: UploadImageOptions = {},
): Promise<UploadApiResponse> {
	const {
		folder = "viaquiz",
		maxWidth = 1920,
		maxHeight = 1080,
		quality = 80,
		format = "webp",
	} = options;

	// 1. Optimize image buffer with Sharp
	const processedBuffer = await sharp(buffer)
		.rotate() // Auto-orient based on EXIF orientation
		.resize({
			width: maxWidth,
			height: maxHeight,
			fit: "inside",
			withoutEnlargement: true,
		})
		.toFormat(format, { quality })
		.toBuffer();

	// 2. Upload processed stream to Cloudinary
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				resource_type: "image",
				format,
			},
			(error, result) => {
				if (error || !result) {
					logger.error("Cloudinary upload failed", { error });
					return reject(error || new Error("Failed to upload image to Cloudinary"));
				}
				resolve(result);
			},
		);

		uploadStream.end(processedBuffer);
	});
}
