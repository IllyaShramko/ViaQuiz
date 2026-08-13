import type { Request, Response, NextFunction } from "express";

export const UploadController = {
	async uploadImage(req: Request, res: Response, next: NextFunction) {
		try {
			const url = res.locals.uploadedUrl || (req as Request & { uploadedUrl?: string }).uploadedUrl;
			const publicId = res.locals.uploadedPublicId;

			res.status(200).json({
				success: true,
				data: {
					url,
					publicId,
				},
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			next(error);
		}
	},
};
