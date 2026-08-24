import app from './app';
import { connectDB } from './config/db';
import { initRedis } from './config/redis';
import { env } from './config/env';
import { logger } from './utils/logger';

// ── Global safety net ───────────────────────────────────────────────────────
// Prevents BullMQ / ioredis internal connection errors from crashing the process
// when Redis is unreachable. We log a warning and continue serving HTTP requests.
process.on('unhandledRejection', (reason: any) => {
  const msg: string = reason?.message || String(reason);
  // Suppress DNS-level Redis errors — they are expected in fallback mode
  if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('getaddrinfo')) {
    logger.warn('⚠️  Suppressed Redis connection rejection (fallback mode active):', msg);
    return;
  }
  logger.error('Unhandled Promise Rejection:', reason);
});

const startServer = async () => {
  try {
    // 1. Connect MongoDB (required — fail fast on error)
    await connectDB();

    // 2. Probe Redis DNS and initialise client if reachable
    await initRedis();

    // 3. Start HTTP server immediately so Render detects the open port
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // 4. Run background migration non-blockingly (does not block HTTP)
    import('./scripts/migrate-books')
      .then(({ migrateBooksToCatalogAndListings }) => migrateBooksToCatalogAndListings())
      .catch((err) => logger.error('Auto migration failed:', err));

    // 5. Start BullMQ background worker pool non-blockingly (skipped if Redis is null)
    import('./jobs/worker-runner')
      .then(({ startWorkerPool }) => startWorkerPool())
      .catch((err) => logger.warn('Worker Pool initialization warning:', err));

    const shutdown = () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

