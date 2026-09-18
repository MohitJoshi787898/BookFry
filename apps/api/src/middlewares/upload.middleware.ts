import multer from 'multer';
import { Request } from 'express';
import { ValidationError } from '../utils/AppError';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only jpeg, png, and webp images are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

export const uploadSingle = (fieldName: string) => upload.single(fieldName);
export const uploadMultiple = (fieldName: string, maxCount: number = 5) =>
  upload.array(fieldName, maxCount);

/**
 * Validates file buffer signatures (magic bytes) to strictly prevent file-extension/MIME spoofing.
 * - JPEG: FF D8 FF
 * - PNG: 89 50 4E 47 0D 0A 1A 0A
 * - WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
 */
export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isRiff && isWebp) {
    return true;
  }

  return false;
}

/**
 * Express middleware to verify uploaded image buffer magic bytes before controller processing.
 */
export const verifyImageFiles = (
  req: Request,
  _res: any,
  next: (err?: any) => void
) => {
  const files: Express.Multer.File[] = [];
  if (req.file) files.push(req.file);
  if (req.files && Array.isArray(req.files)) files.push(...req.files);

  for (const file of files) {
    if (file.buffer && !validateImageMagicBytes(file.buffer)) {
      return next(
        new ValidationError(
          `Invalid image file header signature for "${file.originalname}". Only authentic JPEG, PNG, and WebP images are permitted.`
        )
      );
    }
  }
  next();
};
