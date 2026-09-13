import crypto from 'crypto';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

export type OtpPurpose = 'email_verification' | 'password_reset';

interface MemoryOtpRecord {
  otp: string;
  expiresAt: number;
}

// In-memory TTL fallback when Redis is offline or running unit tests
const inMemoryOtpStore = new Map<string, MemoryOtpRecord>();

export class OtpService {
  private static getKey(email: string, purpose: OtpPurpose): string {
    return `otp:${purpose}:${email.trim().toLowerCase()}`;
  }

  /**
   * Generates a cryptographically strong 6-digit numeric OTP.
   */
  generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Stores the OTP in Redis with an expiration TTL (default: 600s = 10m).
   * Also mirrors in memory fallback and logs prominently to console for testing.
   */
  async storeOtp(
    email: string,
    purpose: OtpPurpose,
    otp: string,
    ttlSeconds = 600
  ): Promise<void> {
    const key = OtpService.getKey(email, purpose);
    const redis = getRedisClient();

    // 1. Store in Redis if connected
    if (redis && redis.status === 'ready') {
      try {
        await redis.set(key, otp, 'EX', ttlSeconds);
      } catch (err) {
        logger.warn('[OtpService] Failed writing OTP to Redis — using fallback store:', err);
      }
    }

    // 2. Always maintain in-memory fallback for offline test resilience
    inMemoryOtpStore.set(key, {
      otp,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // 3. PROMINENT CONSOLE LOG FOR DEVELOPER TESTING
    const border = '='.repeat(64);
    const purposeLabel =
      purpose === 'email_verification'
        ? 'REGISTRATION EMAIL VERIFICATION'
        : 'FORGOT PASSWORD RESET';

    console.log(`\n${border}`);
    console.log('🔐 [BOOKFRY DEV/TESTING OTP DISPATCH]');
    console.log(`📧 Recipient  : ${email}`);
    console.log(`🎯 Purpose    : ${purposeLabel}`);
    console.log(`🔢 OTP Code   : >>> ${otp} <<<`);
    console.log(`⏱️  Validity   : ${Math.round(ttlSeconds / 60)} minutes`);
    console.log(`${border}\n`);

    logger.info(`[OtpService] Generated OTP for ${email} (${purpose})`);
  }

  /**
   * Verifies the provided OTP against Redis or memory fallback.
   * On successful match, deletes the OTP so it cannot be reused.
   */
  async verifyAndConsumeOtp(
    email: string,
    purpose: OtpPurpose,
    candidateOtp: string
  ): Promise<boolean> {
    const key = OtpService.getKey(email, purpose);
    const trimmedCandidate = candidateOtp.trim();
    let storedOtp: string | null = null;

    const redis = getRedisClient();
    if (redis && redis.status === 'ready') {
      try {
        storedOtp = await redis.get(key);
      } catch (err) {
        logger.warn('[OtpService] Failed reading from Redis, checking memory fallback:', err);
      }
    }

    // Fall back to in-memory store if Redis had no record
    if (!storedOtp) {
      const memRecord = inMemoryOtpStore.get(key);
      if (memRecord && memRecord.expiresAt > Date.now()) {
        storedOtp = memRecord.otp;
      } else if (memRecord) {
        inMemoryOtpStore.delete(key);
      }
    }

    if (!storedOtp || storedOtp !== trimmedCandidate) {
      return false;
    }

    // Consume (delete) OTP on success
    if (redis && redis.status === 'ready') {
      try {
        await redis.del(key);
      } catch {
        // Non-blocking
      }
    }
    inMemoryOtpStore.delete(key);

    return true;
  }

  /**
   * Checks if candidate OTP matches without consuming it.
   */
  async peekVerifyOtp(
    email: string,
    purpose: OtpPurpose,
    candidateOtp: string
  ): Promise<boolean> {
    const key = OtpService.getKey(email, purpose);
    const trimmedCandidate = candidateOtp.trim();
    let storedOtp: string | null = null;

    const redis = getRedisClient();
    if (redis && redis.status === 'ready') {
      try {
        storedOtp = await redis.get(key);
      } catch {
        // Fallback
      }
    }

    if (!storedOtp) {
      const memRecord = inMemoryOtpStore.get(key);
      if (memRecord && memRecord.expiresAt > Date.now()) {
        storedOtp = memRecord.otp;
      }
    }

    return Boolean(storedOtp && storedOtp === trimmedCandidate);
  }

  /**
   * Retrieves currently stored OTP for inspection/testing without consuming it.
   */
  async getStoredOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<string | null> {
    const key = OtpService.getKey(email, purpose);
    const redis = getRedisClient();
    if (redis && redis.status === 'ready') {
      try {
        const val = await redis.get(key);
        if (val) return val;
      } catch {
        // Fallback
      }
    }

    const memRecord = inMemoryOtpStore.get(key);
    if (memRecord && memRecord.expiresAt > Date.now()) {
      return memRecord.otp;
    }
    return null;
  }
}

export const otpService = new OtpService();
export default otpService;
