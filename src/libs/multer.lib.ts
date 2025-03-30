import type { Request, Response } from "express";
import multer from "multer";
import { uuidv7 } from "uuidv7";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/app/uploads";

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage_V1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv7()}-${file.originalname}`);
  },
});

export const uploadMiddlewareMore = multer({
  storage: storage_V1,
  fileFilter: (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, 
}).array("pdf", 5); 
