import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/AppError';
import { UserRole } from '@bookmarket/types';

interface DecodedToken {
  userId: string;
  roles: UserRole[];
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new UnauthorizedError('Authentication token missing or invalid');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as DecodedToken;
    req.user = {
      id: decoded.userId,
      roles: decoded.roles,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Authentication token expired or invalid');
  }
};
