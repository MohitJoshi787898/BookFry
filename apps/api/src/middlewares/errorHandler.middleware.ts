import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error on ${req.method} ${req.url}:`, err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      ApiResponse.error(err.message, err.errorCode, err.details)
    );
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json(ApiResponse.error(err.message, 'VALIDATION_ERROR'));
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json(ApiResponse.error('Invalid ID format', 'BAD_REQUEST'));
    return;
  }

  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(500).json(ApiResponse.error(message, 'INTERNAL_SERVER_ERROR'));
};
