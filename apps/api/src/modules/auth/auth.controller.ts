import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { UnauthorizedError } from '../../utils/AppError';
import { getRefreshTokenCookieOptions, getClearRefreshTokenCookieOptions } from '../../utils/cookie';
import { UserRole } from '@bookmarket/types';

export class AuthController {
  private authService: AuthService;
  private usersService: UsersService;

  constructor() {
    this.authService = new AuthService();
    this.usersService = new UsersService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const {
      name,
      email,
      password,
      roles,
      phone,
      storeName,
      bio,
      upiId,
      street,
      city,
      state,
      zipCode,
    } = req.body;
    // Only allow customer and seller roles via public registration.
    // 'admin' role is strictly forbidden from self-registration.
    const safeRoles: UserRole[] = Array.isArray(roles)
      ? (roles.filter((r: string): r is UserRole => r === 'customer' || r === 'seller') as UserRole[])
      : ['customer'];
    const finalRoles: UserRole[] = safeRoles.includes('seller')
      ? ['customer', 'seller']
      : ['customer'];

    const userDoc = await this.usersService.createUser({
      name,
      email,
      password,
      roles: finalRoles,
      phone,
      storeName,
      bio,
      upiId,
      address:
        street && city && state && zipCode
          ? { street, city, state, zipCode, country: 'India' }
          : undefined,
    });

    const accessToken = this.authService.generateAccessToken(userDoc);
    const refreshToken = this.authService.generateRefreshToken(userDoc);

    await this.usersService.updateRefreshToken(userDoc._id.toString(), refreshToken);

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    // Generate, log to terminal, and email verification OTP upon registration
    await this.authService.sendVerificationOtp(userDoc.email, userDoc.name);

    const userDTO = this.usersService.mapToDTO(userDoc);
    res.status(201).json(ApiResponse.success({ user: userDTO, accessToken }));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await this.authService.login(email, password);

    res.cookie('refreshToken', refreshToken, getRefreshTokenCookieOptions());

    const userDTO = this.usersService.mapToDTO(user);
    res.status(200).json(ApiResponse.success({ user: userDTO, accessToken }));
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token missing', 'REFRESH_TOKEN_MISSING');
    }

    const { accessToken, newRefreshToken, user } = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', newRefreshToken, getRefreshTokenCookieOptions());

    const userDTO = this.usersService.mapToDTO(user);
    res.status(200).json(ApiResponse.success({ user: userDTO, accessToken }));
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (userId) {
      await this.authService.logout(userId);
    }

    res.clearCookie('refreshToken', getClearRefreshTokenCookieOptions());

    res.status(200).json(ApiResponse.success({ message: 'Logged out successfully' }));
  };

  me = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }
    const userDoc = await this.usersService.getUserById(req.user.id);
    const userDTO = this.usersService.mapToDTO(userDoc);
    res.status(200).json(ApiResponse.success({ user: userDTO }));
  };

  sendVerificationOtp = async (req: Request, res: Response): Promise<void> => {
    const email = req.body?.email;
    if (!email) {
      throw new UnauthorizedError('Email is required');
    }
    const result = await this.authService.sendVerificationOtp(email);
    res.status(200).json(ApiResponse.success(result));
  };

  verifyEmailOtp = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const userDoc = await this.authService.verifyEmailWithOtp(email, otp);
    const userDTO = this.usersService.mapToDTO(userDoc);
    res.status(200).json(ApiResponse.success({ user: userDTO, message: 'Email verified successfully.' }));
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    const result = await this.authService.forgotPassword(email);
    res.status(200).json(ApiResponse.success(result));
  };

  verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const result = await this.authService.verifyResetOtp(email, otp);
    res.status(200).json(ApiResponse.success(result));
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, password } = req.body;
    const userDoc = await this.authService.resetPasswordWithOtp(email, otp, password);
    const userDTO = this.usersService.mapToDTO(userDoc);
    res.status(200).json(
      ApiResponse.success({
        user: userDTO,
        message: 'Password has been reset successfully. You can now sign in with your new credentials.',
      })
    );
  };
}
export default AuthController;
