import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@bookmarket/types';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError';

export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

export const requireAdmin = requireRoles(['admin']);
