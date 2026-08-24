import Redis from 'ioredis';
import dns from 'dns';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;
let initialized = false;

/** Probes whether a hostname resolves via DNS. Returns false on ENOTFOUND. */
const canResolveHostname = (hostname: string): Promise<boolean> =>
  new Promise((resolve) => {
    dns.lookup(hostname, (err) => resolve(!err));
  });

/** Parses hostname from a redis:// or rediss:// URL string. */
const parseHostname = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

/**
 * Returns the shared Redis client, or null if Redis is unavailable.
 * All callers MUST handle null — Redis is optional infrastructure.
 */
export const getRedisClient = (): Redis | null => {
  if (env.NODE_ENV === 'test' || !env.REDIS_URL) return null;
  return redis;
};

/**
 * Async initialiser — must be called ONCE at startup before any worker/queue creation.
 * Performs a DNS pre-check; if the host is not reachable it skips Redis entirely
 * so BullMQ is never instantiated and no unhandled exceptions can crash the process.
 */
export const initRedis = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;

  const rawUrl = env.REDIS_URL?.trim();
  if (!rawUrl) {
    logger.warn('⚠️  REDIS_URL is not configured — running without Redis (all queues disabled).');
    return;
  }

  // Upstash always requires TLS — auto-upgrade redis:// → rediss://
  const isUpstash = rawUrl.includes('upstash.io');
  const redisUrl =
    isUpstash && rawUrl.startsWith('redis://')
      ? rawUrl.replace(/^redis:\/\//, 'rediss://')
      : rawUrl;
  const isTls = redisUrl.startsWith('rediss://') || isUpstash;

  // === DNS pre-check: if hostname doesn't resolve, skip entirely ===
  const hostname = parseHostname(redisUrl);
  if (hostname) {
    const reachable = await canResolveHostname(hostname);
    if (!reachable) {
      logger.warn(
        `⚠️  Redis host "${hostname}" is unreachable (ENOTFOUND). ` +
          'Running in Redis-free fallback mode — caching and background queues are disabled.'
      );
      return; // redis stays null → queues.ts will create 0 queues → no BullMQ workers
    }
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 5000,
      lazyConnect: true,
      ...(isTls && { tls: { rejectUnauthorized: false } }),
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('⚠️  Redis max reconnect attempts reached — switching to fallback mode.');
          return null;
        }
        return Math.min(times * 1500, 4000);
      },
    });

    client.on('connect', () => logger.info('✅ Redis connected.'));
    client.on('error', (err: any) =>
      logger.warn('⚠️  Redis error (fallback active):', err.message || err)
    );

    await client.connect().catch((err: any) =>
      logger.warn('⚠️  Redis initial connect failed (fallback mode):', err.message || err)
    );

    redis = client;
    logger.info('✅ Redis client initialised.');
  } catch (err: any) {
    logger.warn('⚠️  Redis initialisation failed — fallback mode:', err.message || err);
    redis = null;
  }
};

export default getRedisClient;

