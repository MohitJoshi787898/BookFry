import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { UserModel } from '../../src/models/user.model';
import { otpService } from '../../src/services/otp.service';

describe('OTP & Password Reset Routes Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('Email Verification OTP Flow', () => {
    it('should generate and dispatch verification OTP upon registration', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Aarav Patel',
        email: 'aarav@example.com',
        password: 'Password123!',
      });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);

      const user = await UserModel.findOne({ email: 'aarav@example.com' });
      expect(user?.isEmailVerified).toBe(false);

      // Verify OTP is present in OtpService
      const storedOtp = await otpService.getStoredOtp('aarav@example.com', 'email_verification');
      expect(storedOtp).toBeDefined();
      expect(storedOtp).toHaveLength(6);
    });

    it('should reject invalid OTP for email verification', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Aarav Patel',
        email: 'aarav@example.com',
        password: 'Password123!',
      });

      const verifyRes = await request(app).post('/api/v1/auth/verify-email-otp').send({
        email: 'aarav@example.com',
        otp: '000000',
      });

      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.success).toBe(false);
      expect(verifyRes.body.error.message).toContain('Invalid or expired');
    });

    it('should verify email successfully with valid OTP', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Aarav Patel',
        email: 'aarav@example.com',
        password: 'Password123!',
      });

      const validOtp = await otpService.getStoredOtp('aarav@example.com', 'email_verification');
      expect(validOtp).toBeDefined();

      const verifyRes = await request(app).post('/api/v1/auth/verify-email-otp').send({
        email: 'aarav@example.com',
        otp: validOtp!,
      });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.user.isEmailVerified).toBe(true);

      // Verify updated in DB
      const user = await UserModel.findOne({ email: 'aarav@example.com' });
      expect(user?.isEmailVerified).toBe(true);

      // Verify OTP is consumed
      const afterOtp = await otpService.getStoredOtp('aarav@example.com', 'email_verification');
      expect(afterOtp).toBeNull();
    });

    it('should allow resending verification OTP', async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Aarav Patel',
        email: 'aarav@example.com',
        password: 'Password123!',
      });

      const resendRes = await request(app).post('/api/v1/auth/send-verification-otp').send({
        email: 'aarav@example.com',
      });

      expect(resendRes.status).toBe(200);
      expect(resendRes.body.success).toBe(true);
      expect(resendRes.body.data.message).toContain('Verification OTP has been sent');
    });
  });

  describe('Forgot Password & Reset Flow', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'OldPassword123!',
      });
    });

    it('should generate OTP on forgot password request', async () => {
      const forgotRes = await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'priya@example.com',
      });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body.success).toBe(true);

      const resetOtp = await otpService.getStoredOtp('priya@example.com', 'password_reset');
      expect(resetOtp).toBeDefined();
      expect(resetOtp).toHaveLength(6);
    });

    it('should peek verify reset OTP without consuming it', async () => {
      await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'priya@example.com',
      });

      const resetOtp = await otpService.getStoredOtp('priya@example.com', 'password_reset');

      const peekRes = await request(app).post('/api/v1/auth/verify-reset-otp').send({
        email: 'priya@example.com',
        otp: resetOtp!,
      });

      expect(peekRes.status).toBe(200);
      expect(peekRes.body.success).toBe(true);
      expect(peekRes.body.data.valid).toBe(true);

      // Still in store until password reset is executed
      const stillInStore = await otpService.getStoredOtp('priya@example.com', 'password_reset');
      expect(stillInStore).toBe(resetOtp);
    });

    it('should reset password with valid OTP and allow login with new password', async () => {
      await request(app).post('/api/v1/auth/forgot-password').send({
        email: 'priya@example.com',
      });

      const resetOtp = await otpService.getStoredOtp('priya@example.com', 'password_reset');

      const resetRes = await request(app).post('/api/v1/auth/reset-password').send({
        email: 'priya@example.com',
        otp: resetOtp!,
        password: 'NewSecurePassword456!',
      });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);

      // OTP should now be consumed
      const afterOtp = await otpService.getStoredOtp('priya@example.com', 'password_reset');
      expect(afterOtp).toBeNull();

      // Old password should fail
      const oldLoginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'priya@example.com',
        password: 'OldPassword123!',
      });
      expect(oldLoginRes.status).toBe(401);

      // New password should succeed
      const newLoginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'priya@example.com',
        password: 'NewSecurePassword456!',
      });
      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body.success).toBe(true);
    });
  });
});
