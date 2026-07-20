import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  if (env.NODE_ENV === 'test') {
    return; // Tests will spin up their own in-memory database
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('✅ MongoDB Disconnected');
  } catch (error) {
    logger.error('❌ Error disconnecting MongoDB:', error);
  }
};
