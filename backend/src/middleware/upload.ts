import fs from "fs";
import path from "path";
import multer from "multer";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

function storageFor(subfolder: string) {
  const destination = path.join(uploadRoot, subfolder);
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, destination),
    filename: (_req, file, callback) => {
      const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      callback(null, safeName);
    },
  });
}

/**
 * Accepts a single PDF resume up to MAX_RESUME_SIZE_MB.
 */
export const resumeUpload = multer({
  storage: storageFor("resumes"),
  limits: { fileSize: env.MAX_RESUME_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(ApiError.badRequest("Resume must be a PDF file."));
      return;
    }
    callback(null, true);
  },
});

/**
 * Accepts a single image for avatars or company logos.
 */
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_IMAGE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(ApiError.badRequest("Only image files are allowed."));
      return;
    }
    callback(null, true);
  },
});
