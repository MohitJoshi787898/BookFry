import { CookieOptions } from 'express';
import { env } from '../config/env';

/**
 * Generates production-ready cookie options for the refresh token.
 * 
 * In cross-origin environments (e.g. Next.js on port 3000 fetching API on port 5000,
 * or https://bookfry.in fetching https://bookfry.onrender.com):
 * - Production: `sameSite: 'none'`, `secure: true`, `path: '/'` allows browsers to send credentials cross-origin.
 * - Development: `sameSite: 'lax'`, `secure: false`, `path: '/'` allows localhost HTTP cookies.
 */
export const getRefreshTokenCookieOptions = (): CookieOptions => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
};

/**
 * Cookie options for clearing the refresh token upon logout or revocation.
 */
export const getClearRefreshTokenCookieOptions = (): CookieOptions => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
};
