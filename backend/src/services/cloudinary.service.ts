import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
}

export class CloudinaryService {
  async uploadImage(filePath: string, folder = "schoolsetu") {
    if (!env.CLOUDINARY_CLOUD_NAME) {
      return { skipped: true, reason: "Cloudinary credentials not configured", filePath };
    }

    return cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto"
    });
  }

  async deleteAsset(publicId: string) {
    if (!env.CLOUDINARY_CLOUD_NAME) {
      return { skipped: true, reason: "Cloudinary credentials not configured", publicId };
    }

    return cloudinary.uploader.destroy(publicId);
  }
}

export const cloudinaryService = new CloudinaryService();
