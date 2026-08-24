import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    await connectDB();

    // 1. Start HTTP server immediately so Render detects open port without delay
    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // 2. Run background migration non-blockingly
    import('./scripts/migrate-books')
      .then(({ migrateBooksToCatalogAndListings }) => migrateBooksToCatalogAndListings())
      .catch((err) => logger.error('Auto migration failed:', err));

    // 3. Start BullMQ background worker pool non-blockingly
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
