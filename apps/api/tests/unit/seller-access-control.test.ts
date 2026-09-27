import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SellerAccessPolicy } from '../../src/modules/admin/seller-access.policy';
import { PlatformSettingsModel } from '../../src/models/platform-settings.model';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { ForbiddenError } from '../../src/utils/AppError';
import bcrypt from 'bcryptjs';

vi.mock('../../src/modules/users/users.service', () => {
  return {
    UsersService: vi.fn().mockImplementation(() => {
      return {
        getUserByEmail: vi.fn(),
        getUserById: vi.fn(),
        createUser: vi.fn(),
        updateRefreshToken: vi.fn(),
        verifyRefreshToken: vi.fn(),
        mapToDTO: vi.fn().mockImplementation((u) => u),
      };
    }),
  };
});

describe('Seller Access Control Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    SellerAccessPolicy.invalidateCache();
  });

  describe('SellerAccessPolicy', () => {
    it('should default both registration and login to false when settings document is missing', async () => {
      vi.spyOn(PlatformSettingsModel, 'findOne').mockResolvedValue(null as any);
      vi.spyOn(PlatformSettingsModel, 'create').mockResolvedValue({
        sellerRegistrationEnabled: false,
        sellerLoginEnabled: false,
        maintenanceMode: false,
      } as any);

      const regEnabled = await SellerAccessPolicy.isSellerRegistrationEnabled();
      const loginEnabled = await SellerAccessPolicy.isSellerLoginEnabled();
      const publicSettings = await SellerAccessPolicy.getPublicSettings();

      expect(regEnabled).toBe(false);
      expect(loginEnabled).toBe(false);
      expect(publicSettings).toMatchObject({
        sellerRegistrationEnabled: false,
        sellerLoginEnabled: false,
      });
    });

    it('should read boolean settings from PlatformSettingsModel', async () => {
      vi.spyOn(PlatformSettingsModel, 'findOne').mockResolvedValue({
        sellerRegistrationEnabled: true,
        sellerLoginEnabled: false,
      } as any);

      const regEnabled = await SellerAccessPolicy.isSellerRegistrationEnabled();
      expect(regEnabled).toBe(true);

      SellerAccessPolicy.invalidateCache();

      vi.spyOn(PlatformSettingsModel, 'findOne').mockResolvedValue({
        sellerRegistrationEnabled: false,
        sellerLoginEnabled: true,
      } as any);

      const loginEnabled = await SellerAccessPolicy.isSellerLoginEnabled();
      expect(loginEnabled).toBe(true);
    });

    it('should cache settings and not hit the database on subsequent calls until invalidated', async () => {
      const findOneSpy = vi.spyOn(PlatformSettingsModel, 'findOne').mockResolvedValue({
        sellerRegistrationEnabled: false,
        sellerLoginEnabled: false,
      } as any);

      await SellerAccessPolicy.isSellerRegistrationEnabled();
      await SellerAccessPolicy.isSellerLoginEnabled();
      await SellerAccessPolicy.getPublicSettings();

      // Only one db query because subsequent calls hit memory cache
      expect(findOneSpy).toHaveBeenCalledTimes(1);

      // Invalidate cache
      SellerAccessPolicy.invalidateCache();

      await SellerAccessPolicy.isSellerRegistrationEnabled();
      expect(findOneSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('AuthService - Seller Login Enforcement', () => {
    let authService: AuthService;
    let mockUsersService: any;

    beforeEach(() => {
      authService = new AuthService();
      mockUsersService = (authService as any).usersService;
      vi.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);
    });

    it('should allow buyer login even when seller login is disabled', async () => {
      vi.spyOn(SellerAccessPolicy, 'isSellerLoginEnabled').mockResolvedValue(false);

      const mockBuyer = {
        _id: 'buyer123',
        email: 'buyer@example.com',
        passwordHash: 'hashed',
        roles: ['customer'],
        isBanned: false,
        save: vi.fn().mockResolvedValue(true),
      } as any;

      mockUsersService.getUserByEmail.mockResolvedValue(mockBuyer);

      const result = await authService.login('buyer@example.com', 'password123');
      expect(result.user).toEqual(mockBuyer);
      expect(result.accessToken).toBeTypeOf('string');
    });

    it('should reject seller login with SELLER_LOGIN_DISABLED when seller login is disabled', async () => {
      vi.spyOn(SellerAccessPolicy, 'isSellerLoginEnabled').mockResolvedValue(false);

      const mockSeller = {
        _id: 'seller123',
        email: 'seller@example.com',
        passwordHash: 'hashed',
        roles: ['customer', 'seller'],
        isBanned: false,
        save: vi.fn().mockResolvedValue(true),
      } as any;

      mockUsersService.getUserByEmail.mockResolvedValue(mockSeller);

      await expect(
        authService.login('seller@example.com', 'password123')
      ).rejects.toThrow(ForbiddenError);

      try {
        await authService.login('seller@example.com', 'password123');
      } catch (err: any) {
        expect(err.errorCode).toBe('SELLER_LOGIN_DISABLED');
      }
    });

    it('should allow seller login when seller login is enabled', async () => {
      vi.spyOn(SellerAccessPolicy, 'isSellerLoginEnabled').mockResolvedValue(true);

      const mockSeller = {
        _id: 'seller123',
        email: 'seller@example.com',
        passwordHash: 'hashed',
        roles: ['customer', 'seller'],
        isBanned: false,
        save: vi.fn().mockResolvedValue(true),
      } as any;

      mockUsersService.getUserByEmail.mockResolvedValue(mockSeller);

      const result = await authService.login('seller@example.com', 'password123');
      expect(result.user).toEqual(mockSeller);
      expect(result.accessToken).toBeTypeOf('string');
    });

    it('should ALWAYS allow admin login even when seller login is disabled', async () => {
      vi.spyOn(SellerAccessPolicy, 'isSellerLoginEnabled').mockResolvedValue(false);

      const mockAdmin = {
        _id: 'admin123',
        email: 'admin@bookfry.com',
        passwordHash: 'hashed',
        roles: ['customer', 'seller', 'admin'],
        isBanned: false,
        save: vi.fn().mockResolvedValue(true),
      } as any;

      mockUsersService.getUserByEmail.mockResolvedValue(mockAdmin);

      const result = await authService.login('admin@bookfry.com', 'password123');
      expect(result.user).toEqual(mockAdmin);
      expect(result.accessToken).toBeTypeOf('string');
    });
  });

  describe('AuthController - Seller Registration Enforcement', () => {
    let authController: AuthController;
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
      authController = new AuthController();
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
      };
    });

    it('should allow pure customer registration when seller registration is disabled', async () => {
      vi.spyOn(SellerAccessPolicy, 'isSellerRegistrationEnabled').mockResolvedValue(false);

      mockReq = {
        body: {
          email: 'buyer@example.com',
          password: 'Password123!',
          name: 'Jane Buyer',
          roles: ['customer'],
        },
      };

      vi.spyOn((authController as any).usersService, 'getUserByEmail').mockResolvedValue(null);
      vi.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed'));
      vi.spyOn((authController as any).usersService, 'createUser').mockResolvedValue({
        _id: 'new_buyer_1',
        email: 'buyer@example.com',
        name: 'Jane Buyer',
        roles: ['customer'],
      });
      vi.spyOn((authController as any).authService, 'generateAccessToken').mockReturnValue('mock-access-token');
      vi.spyOn((authController as any).authService, 'generateRefreshToken').mockReturnValue('mock-refresh-token');
      vi.spyOn((authController as any).usersService, 'updateRefreshToken').mockResolvedValue(undefined);
      vi.spyOn((authController as any).authService, 'sendVerificationOtp').mockResolvedValue(undefined);

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    it('should reject seller registration with SELLER_REGISTRATION_DISABLED when disabled', async () => {
      vi.spyOn(SellerAccessPolicy, 'isSellerRegistrationEnabled').mockResolvedValue(false);

      mockReq = {
        body: {
          email: 'new_seller@example.com',
          password: 'Password123!',
          name: 'Bob Seller',
          roles: ['seller'],
        },
      };

      await expect(authController.register(mockReq, mockRes)).rejects.toThrow(ForbiddenError);

      try {
        await authController.register(mockReq, mockRes);
      } catch (err: any) {
        expect(err.errorCode).toBe('SELLER_REGISTRATION_DISABLED');
      }
    });

    it('should allow seller registration when seller registration is enabled', async () => {
      vi.spyOn(SellerAccessPolicy, 'isSellerRegistrationEnabled').mockResolvedValue(true);

      mockReq = {
        body: {
          email: 'new_seller@example.com',
          password: 'Password123!',
          name: 'Bob Seller',
          roles: ['seller'],
        },
      };

      vi.spyOn((authController as any).usersService, 'getUserByEmail').mockResolvedValue(null);
      vi.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed'));
      vi.spyOn((authController as any).usersService, 'createUser').mockResolvedValue({
        _id: 'new_seller_1',
        email: 'new_seller@example.com',
        name: 'Bob Seller',
        roles: ['customer', 'seller'],
      });
      vi.spyOn((authController as any).authService, 'generateAccessToken').mockReturnValue('mock-access-token');
      vi.spyOn((authController as any).authService, 'generateRefreshToken').mockReturnValue('mock-refresh-token');
      vi.spyOn((authController as any).usersService, 'updateRefreshToken').mockResolvedValue(undefined);
      vi.spyOn((authController as any).authService, 'sendVerificationOtp').mockResolvedValue(undefined);

      await authController.register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });
});
