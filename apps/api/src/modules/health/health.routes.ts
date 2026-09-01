import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { getRedisClient } from '../../config/redis';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const mongoStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const mongoReadyState = mongoose.connection.readyState;
  const mongoStatus = mongoStateMap[mongoReadyState] || 'unknown';

  const redis = getRedisClient();
  let redisStatus = 'fallback_null';
  if (redis) {
    redisStatus = redis.status === 'ready' || redis.status === 'connect' ? 'connected' : redis.status;
  }

  const isHealthy = mongoReadyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      mongodb: {
        status: mongoStatus,
        connected: mongoReadyState === 1,
      },
      redis: {
        status: redisStatus,
        configured: Boolean(process.env.REDIS_URL),
      },
    },
  });
});

export default router;
