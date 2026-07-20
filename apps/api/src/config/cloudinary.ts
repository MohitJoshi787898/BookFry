import { logger } from '../utils/logger';

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
}

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string
): Promise<CloudinaryUploadResponse> => {
  // Simulates a successful Cloudinary response
  const mockPublicId = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const mockUrl = `https://res.cloudinary.com/demo/image/upload/v123456789/${mockPublicId}.jpg`;

  logger.info(`Simulated Cloudinary upload to folder "${folder}"`);
  return {
    url: mockUrl,
    publicId: mockPublicId,
  };
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  logger.info(`Simulated Cloudinary deletion for publicId "${publicId}"`);
};
