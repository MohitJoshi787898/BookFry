import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../utils/AppError';

export class AuthController {
  private authService: AuthService;
  private usersService: UsersService;

  constructor() {
    this.authService = new AuthService();
    this.usersService = new UsersService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, roles } = req.body;
    const userDoc = await this.usersService.createUser({ name, email, password, roles });

    const accessToken = this.authService.generateAccessToken(userDoc);
    const refreshToken = this.authService.generateRefreshToken(userDoc);

    await this.usersService.updateRefreshToken(userDoc._id.toString(), refreshToken);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userDTO = this.usersService.mapToDTO(userDoc);
    res.status(201).json(ApiResponse.success({ user: userDTO, accessToken }));
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await this.authService.login(email, password);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userDTO = this.usersService.mapToDTO(user);
    res.status(200).json(ApiResponse.success({ user: userDTO, accessToken }));
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token missing');
    }

    const { accessToken, newRefreshToken, user } = await this.authService.refresh(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userDTO = this.usersService.mapToDTO(user);
    res.status(200).json(ApiResponse.success({ user: userDTO, accessToken }));
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (userId) {
      await this.authService.logout(userId);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

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
}
export default AuthController;
