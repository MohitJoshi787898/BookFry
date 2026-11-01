import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

export const xssMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
      req.body = sanitizeObj(req.body);
    }
    if (req.query) {
      req.query = sanitizeObj(req.query);
    }
    if (req.params) {
      req.params = sanitizeObj(req.params);
    }
    next();
  };
};

function sanitizeObj(obj: any): any {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObj);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitizedObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitizedObj[key] = sanitizeObj(obj[key]);
      }
    }
    return sanitizedObj;
  }
  return obj;
}
