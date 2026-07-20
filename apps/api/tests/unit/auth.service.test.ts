import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/modules/auth/auth.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UnauthorizedError } from '../../src/utils/AppError';

vi.mock('../../src/modules/users/users.service', () => {
  return {
    UsersService: vi.fn().mockImplementation(() => {
      return {
        getUserByEmail: vi.fn(),
        getUserById: vi.fn(),
        updateRefreshToken: vi.fn(),
        verifyRefreshToken: vi.fn(),
      };
    }),
  };
});

describe('AuthService Unit Tests', () => {
  let authService: AuthService;
  let mockUsersService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
    mockUsersService = (authService as any).usersService;
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const mockUser = { _id: 'user123', roles: ['customer'] } as any;
      const token = authService.generateAccessToken(mockUser);
      expect(token).toBeTypeOf('string');

      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe('user123');
      expect(decoded.roles).toContain('customer');
    });
  });

  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        roles: ['customer'],
        isBanned: false,
      } as any;

      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBeTypeOf('string');
      expect(result.refreshToken).toBeTypeOf('string');
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith('user123', result.refreshToken);
    });

    it('should throw UnauthorizedError with invalid email', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'password')).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('should throw UnauthorizedError with invalid password', async () => {
      const mockUser = {
        _id: 'user123',
        passwordHash: 'hashedpassword',
        isBanned: false,
      } as any;

      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      vi.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedError
      );
    });
  });
});
