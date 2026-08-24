import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;
let initialized = false;

export const getRedisClient = (): Redis | null => {
  if (env.NODE_ENV === 'test' || !env.REDIS_URL) {
    return null;
  }

  if (!initialized) {
    initialized = true;
    try {
      let redisUrl = env.REDIS_URL.trim();
      const isUpstash = redisUrl.includes('upstash.io');
      const isTls = redisUrl.startsWith('rediss://') || isUpstash;

      // Upstash Redis requires rediss:// (TLS)
      if (isUpstash && redisUrl.startsWith('redis://')) {
        redisUrl = redisUrl.replace(/^redis:\/\//, 'rediss://');
      }

      const client = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        connectTimeout: 5000,
        lazyConnect: true,
        ...(isTls && { tls: { rejectUnauthorized: false } }),
        retryStrategy(times) {
          if (times > 5) {
            logger.warn('⚠️ Redis max reconnection attempts reached. Pausing retry loop to allow application fallback.');
            return null; // Stop retrying after 5 attempts
          }
          return Math.min(times * 1000, 3000);
        },
      });

      client.on('connect', () => {
        logger.info('✅ Redis Connected successfully');
      });

      client.on('error', (err: any) => {
        logger.error('❌ Redis connection error (fallback mode active):', err.message || err);
      });

      // Connect asynchronously without blocking main thread
      client.connect().catch((err: any) => {
        logger.warn('⚠️ Initial Redis connection failed (running in fallback mode):', err.message || err);
      });

      redis = client;
    } catch (error) {
      logger.error('❌ Redis initialization error:', error);
      redis = null;
    }
  }

  return redis;
};

export default getRedisClient;
