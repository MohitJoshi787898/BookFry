import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { env } from '../../config/env';
import { UnauthorizedError, ValidationError } from '../../utils/AppError';
import { IUserDocument } from '../../models/user.model';
import { UserRole } from '@bookmarket/types';
import { otpService } from '../../services/otp.service';
import { EmailService } from '../../services/email.service';

export class AuthService {
  private usersService: UsersService;
  private emailService: EmailService;

  constructor() {
    this.usersService = new UsersService();
    this.emailService = new EmailService();
  }

  generateAccessToken(user: IUserDocument): string {
    return jwt.sign(
      { userId: user._id.toString(), roles: user.roles },
      env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  }

  generateRefreshToken(user: IUserDocument): string {
    return jwt.sign(
      { userId: user._id.toString() },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUserDocument; accessToken: string; refreshToken: string }> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user || user.isBanned) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Auto-promote admin@bookfry.com to full multi-role access if missing any role
    if (email.toLowerCase() === 'admin@bookfry.com') {
      let needsSave = false;
      const allRoles: ('customer' | 'seller' | 'admin')[] = ['customer', 'seller', 'admin'];
      const missingRole = allRoles.some((r) => !user.roles.includes(r));
      if (missingRole) {
        user.roles = allRoles;
        needsSave = true;
      }
      if (user.sellerOnboardingStatus !== 'complete') {
        user.sellerOnboardingStatus = 'complete';
        needsSave = true;
      }
      if (user.sellerVerificationStatus !== 'approved') {
        user.sellerVerificationStatus = 'approved';
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken);

    return { user, accessToken, refreshToken };
  }

  async refresh(
    refreshToken: string
  ): Promise<{ accessToken: string; newRefreshToken: string; user: IUserDocument }> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { userId: string };
      const user = await this.usersService.getUserById(decoded.userId);

      if (user.isBanned) {
        await this.usersService.updateRefreshToken(user._id.toString(), null);
        throw new UnauthorizedError('Your account has been suspended. Please contact support.', 'ACCOUNT_BANNED');
      }

      const isValid = await this.usersService.verifyRefreshToken(user, refreshToken);
      if (!isValid) {
        await this.usersService.updateRefreshToken(user._id.toString(), null);
        throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
      }

      // Ensure admin@bookfry.com always retains full multi-role access
      if (user.email.toLowerCase() === 'admin@bookfry.com') {
        let needsSave = false;
        const allRoles: ('customer' | 'seller' | 'admin')[] = ['customer', 'seller', 'admin'];
        const missingRole = allRoles.some((r) => !user.roles.includes(r));
        if (missingRole) {
          user.roles = allRoles;
          needsSave = true;
        }
        if (user.sellerOnboardingStatus !== 'complete') {
          user.sellerOnboardingStatus = 'complete';
          needsSave = true;
        }
        if (user.sellerVerificationStatus !== 'approved') {
          user.sellerVerificationStatus = 'approved';
          needsSave = true;
        }
        if (needsSave) {
          await user.save();
        }
      }

      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      await this.usersService.updateRefreshToken(user._id.toString(), newRefreshToken);

      return { accessToken, newRefreshToken, user };
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  /**
   * Generates, saves in Redis, logs to terminal, and emails an email verification OTP.
   */
  async sendVerificationOtp(email: string, name?: string): Promise<{ success: boolean; message: string }> {
    const otp = otpService.generateOtp();
    await otpService.storeOtp(email, 'email_verification', otp, 600);
    await this.emailService.sendEmailVerificationOtp(email, name || 'Reader', otp);
    return { success: true, message: 'Verification OTP has been sent to your email.' };
  }

  /**
   * Verifies the 6-digit OTP against Redis/store and marks the user's email as verified.
   */
  async verifyEmailWithOtp(email: string, otp: string): Promise<IUserDocument> {
    const isValid = await otpService.verifyAndConsumeOtp(email, 'email_verification', otp);
    if (!isValid) {
      throw new ValidationError('Invalid or expired verification code.');
    }
    return this.usersService.verifyUserEmail(email);
  }

  /**
   * Initiates forgot password flow: generates OTP, stores in Redis, logs, and emails.
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.usersService.getUserByEmail(email);
    if (user) {
      const otp = otpService.generateOtp();
      await otpService.storeOtp(email, 'password_reset', otp, 600);
      await this.emailService.sendPasswordResetOtp(email, user.name, otp);
    }
    // Always return success message for security/anti-enumeration
    return {
      success: true,
      message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
    };
  }

  /**
   * Checks if reset OTP is valid without consuming it yet.
   */
  async verifyResetOtp(email: string, otp: string): Promise<{ valid: boolean }> {
    const isValid = await otpService.peekVerifyOtp(email, 'password_reset', otp);
    if (!isValid) {
      throw new ValidationError('Invalid or expired reset code.');
    }
    return { valid: true };
  }

  /**
   * Verifies OTP, updates password, and invalidates existing sessions.
   */
  async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<IUserDocument> {
    const isValid = await otpService.verifyAndConsumeOtp(email, 'password_reset', otp);
    if (!isValid) {
      throw new ValidationError('Invalid or expired reset code.');
    }
    return this.usersService.resetUserPassword(email, newPassword);
  }
}
export default AuthService;
