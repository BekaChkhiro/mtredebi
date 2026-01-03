import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { validateFile } from '../services/upload.service';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const validation = validateFile(file);
  if (validation.valid) {
    cb(null, true);
  } else {
    cb(new Error(validation.error));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
});

// Single image upload middleware
export const uploadSingleImage = upload.single('image');

// Error handler for multer
export function handleMulterError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Maximum size: 5MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Only 1 file allowed',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field. Use "image" as field name',
      });
    }
    return res.status(400).json({
      error: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: err.message || 'File upload error',
    });
  }

  next();
}
