import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';
import { logger } from '../utils/logger';

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
}

/**
 * Uploads a file buffer directly to Cloudinary using upload_stream.
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    logger.info(`Starting Cloudinary upload stream to folder "${folder}"...`);
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload stream failed:', error);
          return reject(error);
        }
        if (!result) {
          logger.error('Cloudinary upload returned null or undefined result.');
          return reject(new Error('Cloudinary upload returned no result'));
        }
        logger.info(`Successfully uploaded to Cloudinary: ${result.secure_url}`);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes a resource from Cloudinary by public ID.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    logger.info(`Requesting Cloudinary resource deletion for publicId: "${publicId}"...`);
    await cloudinary.uploader.destroy(publicId);
    logger.info('Cloudinary deletion successful.');
  } catch (error) {
    logger.error(`Failed to delete Cloudinary resource "${publicId}":`, error);
  }
};
