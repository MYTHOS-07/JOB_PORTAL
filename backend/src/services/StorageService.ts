import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);

/**
 * Stores profile photos and logos on Cloudinary when credentials are set,
 * otherwise writes files to the local uploads directory.
 */
export class StorageService {
  constructor() {
    if (this.isCloudinaryConfigured()) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
    }
  }

  isCloudinaryConfigured() {
    return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
  }

  async saveImage(file: Express.Multer.File, folder: "avatars" | "logos"): Promise<string> {
    if (this.isCloudinaryConfigured()) {
      return this.uploadCloudinary(file, folder);
    }
    return this.saveLocal(file);
  }

  private saveLocal(file: Express.Multer.File): string {
    const destination = path.join(uploadRoot, "images");
    fs.mkdirSync(destination, { recursive: true });
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    fs.writeFileSync(path.join(destination, filename), file.buffer);
    return `/uploads/images/${filename}`;
  }

  private uploadCloudinary(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(error ?? new Error("Cloudinary upload failed."));
            return;
          }
          resolve(result.secure_url);
        },
      );
      stream.end(file.buffer);
    });
  }
}

export const storageService = new StorageService();
