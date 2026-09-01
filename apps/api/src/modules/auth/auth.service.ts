import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../utils/AppError';
import { IUserDocument } from '../../models/user.model';
import { UserRole } from '@bookmarket/types';

export class AuthService {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
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

    // Auto-promote admin@bookfry.com to admin role if missing
    if (email.toLowerCase() === 'admin@bookfry.com' && !user.roles.includes('admin')) {
      user.roles = ['customer', 'seller', 'admin'];
      await user.save();
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

      const isValid = await this.usersService.verifyRefreshToken(user, refreshToken);
      if (!isValid) {
        await this.usersService.updateRefreshToken(user._id.toString(), null);
        throw new UnauthorizedError('Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
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
}
export default AuthService;
