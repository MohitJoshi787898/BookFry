import { UserRole } from '@bookmarket/types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: UserRole[];
      };
    }
  }
}
