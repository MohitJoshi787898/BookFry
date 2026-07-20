import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (env.NODE_ENV === 'test') {
    return null;
  }

  if (!redis) {
    try {
      redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      });

      redis.on('connect', () => {
        logger.info('✅ Redis Connected');
      });

      redis.on('error', (err) => {
        logger.error('❌ Redis connection error:', err);
      });
    } catch (error) {
      logger.error('❌ Redis initialization error:', error);
    }
  }

  return redis;
};
