import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UsersRepository } from './users.repository';
import { UserModel, IUserDocument } from '../../models/user.model';
import { CartModel } from '../../models/cart.model';
import { NominatimGeocodingProvider } from './geocoding.provider';
import { NotificationsService } from '../notifications/notifications.service';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../utils/AppError';
import { User, UserRole } from '@bookmarket/types';

export class UsersService {
  private usersRepository: UsersRepository;

  constructor() {
    this.usersRepository = new UsersRepository();
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    roles?: UserRole[];
    phone?: string;
    storeName?: string;
    bio?: string;
    upiId?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country?: string;
    };
  }): Promise<IUserDocument> {
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const isSeller = (data.roles || []).includes('seller') || !!data.storeName;
    const sellerProfile = isSeller
      ? {
          storeName: data.storeName || `${data.name}'s Books`,
          bio: data.bio || '',
          rating: 5.0,
          totalSales: 0,
          payoutDetails: data.upiId ? { upiId: data.upiId } : undefined,
        }
      : null;

    const addresses = data.address
      ? [
          {
            street: data.address.street,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
            country: data.address.country || 'India',
            isDefault: true,
          },
        ]
      : [];

    const rawRoles = data.roles || ['customer'];
    const safeRoles: UserRole[] = rawRoles.includes('seller')
      ? (Array.from(new Set(['customer', ...rawRoles])) as UserRole[])
      : (rawRoles.length > 0 ? rawRoles : ['customer']) as UserRole[];

    const finalRoles: UserRole[] =
      data.email.toLowerCase() === 'admin@bookfry.com'
        ? ['customer', 'seller', 'admin']
        : safeRoles;

    // Determine onboarding completeness for sellers:
    // If the seller completed all required store & payout details during registration,
    // mark onboarding as complete immediately so they go straight to their functional dashboard.
    const isSellerRole = finalRoles.includes('seller');
    const hasRequiredSellerDetails =
      !!data.phone && !!data.upiId && !!(data.storeName || sellerProfile?.storeName);

    const sellerOnboardingStatus = isSellerRole
      ? hasRequiredSellerDetails
        ? ('complete' as const)
        : ('incomplete' as const)
      : undefined;

    const sellerVerificationStatus = isSellerRole
      ? ('not_submitted' as const)
      : undefined;

    const userDoc = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      roles: finalRoles,
      phone: data.phone,
      isEmailVerified: false,
      isBanned: false,
      addresses: addresses as any,
      sellerProfile: sellerProfile as any,
      sellerOnboardingStatus,
      sellerVerificationStatus,
    });

    return userDoc;
  }

  async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  async getUserById(id: string): Promise<IUserDocument> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    let refreshTokenHash: string | null = null;
    if (refreshToken) {
      const salt = await bcrypt.genSalt(10);
      refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    }
    await this.usersRepository.update(id, { refreshTokenHash });
  }

  async verifyRefreshToken(user: IUserDocument, token: string): Promise<boolean> {
    if (!user.refreshTokenHash) return false;
    return bcrypt.compare(token, user.refreshTokenHash);
  }

  mapToDTO(user: IUserDocument): User {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      isBanned: user.isBanned,
      addresses: (user.addresses || []).map((addr: any) => ({
        _id: addr._id ? addr._id.toString() : undefined,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country,
        isDefault: addr.isDefault,
      })),
      sellerProfile: user.sellerProfile
        ? {
            storeName: user.sellerProfile.storeName,
            bio: user.sellerProfile.bio,
            rating: user.sellerProfile.rating,
            totalSales: user.sellerProfile.totalSales,
            payoutDetails: user.sellerProfile.payoutDetails,
          }
        : null,
      // Seller onboarding & verification state — only present for sellers
      sellerOnboardingStatus: user.sellerOnboardingStatus,
      sellerVerificationStatus: user.sellerVerificationStatus,
      sellerVerificationSubmittedAt: user.sellerVerificationSubmittedAt?.toISOString(),
      sellerVerificationRejectionReason: user.sellerVerificationRejectionReason,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; avatarUrl?: string }
  ): Promise<IUserDocument> {
    const user = await this.getUserById(userId);
    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;
    await user.save();
    return user;
  }

  /**
   * Update the seller's profile (onboarding completion step).
   * This is called from PATCH /users/me/seller-profile.
   * Determines onboarding completeness based on required seller fields.
   */
  async updateSellerProfile(
    userId: string,
    data: {
      storeName?: string;
      bio?: string;
      phone?: string;
      upiId?: string;
      collegeName?: string;
      courseYear?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      street?: string;
    }
  ): Promise<IUserDocument> {
    const user = await this.getUserById(userId);

    // Ensure user has seller role
    if (!user.roles.includes('seller')) {
      user.roles = [...user.roles, 'seller'] as UserRole[];
      // Initialize verification status if not set
      if (!user.sellerVerificationStatus) {
        user.sellerVerificationStatus = 'not_submitted';
      }
    }

    // Update basic profile fields
    if (data.phone !== undefined) user.phone = data.phone;

    // Build or update sellerProfile
    const existingProfile = user.sellerProfile;
    user.sellerProfile = {
      storeName: data.storeName || existingProfile?.storeName || `${user.name}'s Books`,
      bio: data.bio ?? existingProfile?.bio ?? '',
      rating: existingProfile?.rating ?? 5.0,
      totalSales: existingProfile?.totalSales ?? 0,
      payoutDetails: {
        ...existingProfile?.payoutDetails,
        ...(data.upiId ? { upiId: data.upiId } : {}),
      },
    };

    // Update address if location data provided
    if (data.street && data.city && data.state && data.zipCode) {
      const defaultAddr = user.addresses.find((a: any) => a.isDefault);
      if (defaultAddr) {
        (defaultAddr as any).street = data.street;
        (defaultAddr as any).city = data.city;
        (defaultAddr as any).state = data.state;
        (defaultAddr as any).zipCode = data.zipCode;
      } else {
        user.addresses.push({
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: 'India',
          isDefault: true,
        } as any);
      }
    }

    // Determine onboarding completeness:
    // Required: storeName, phone, upiId
    const hasStoreName = !!(user.sellerProfile?.storeName);
    const hasPhone = !!(user.phone);
    const hasUpi = !!(user.sellerProfile?.payoutDetails?.upiId);

    user.sellerOnboardingStatus = hasStoreName && hasPhone && hasUpi ? 'complete' : 'incomplete';

    await user.save();
    return user;
  }

  /**
   * Submit a seller verification request.
   * Sellers cannot approve themselves — this sets status to 'pending' for admin review.
   * Called from POST /users/me/seller-verification.
   */
  async submitSellerVerification(userId: string): Promise<IUserDocument> {
    const user = await this.getUserById(userId);

    if (!user.roles.includes('seller')) {
      throw new ForbiddenError('Only sellers can submit verification requests');
    }

    if (user.sellerOnboardingStatus !== 'complete') {
      throw new ValidationError(
        'Please complete your seller profile before submitting for verification'
      );
    }

    const currentStatus = user.sellerVerificationStatus;
    if (currentStatus === 'approved') {
      throw new ValidationError('Your seller account is already verified');
    }
    if (currentStatus === 'pending') {
      throw new ValidationError('Your verification request is already under review');
    }

    user.sellerVerificationStatus = 'pending';
    user.sellerVerificationSubmittedAt = new Date();
    user.sellerVerificationRejectionReason = undefined;

    await user.save();
    return user;
  }

  async addAddress(
    userId: string,
    address: { street: string; city: string; state: string; zipCode: string; country: string; isDefault?: boolean }
  ): Promise<IUserDocument> {
    const user = await this.getUserById(userId);
    const isDefault = address.isDefault ?? false;

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: isDefault || user.addresses.length === 0,
    } as any);

    await user.save();
    return user;
  }

  async updateAddress(
    userId: string,
    addressId: string,
    address: { street?: string; city?: string; state?: string; zipCode?: string; country?: string; isDefault?: boolean }
  ): Promise<IUserDocument> {
    const user = await this.getUserById(userId);
    const target = user.addresses.find((addr: any) => addr._id.toString() === addressId) as any;
    if (!target) {
      throw new NotFoundError('Address not found');
    }

    if (address.street !== undefined) target.street = address.street;
    if (address.city !== undefined) target.city = address.city;
    if (address.state !== undefined) target.state = address.state;
    if (address.zipCode !== undefined) target.zipCode = address.zipCode;
    if (address.country !== undefined) target.country = address.country;

    if (address.isDefault === true) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      target.isDefault = true;
    } else if (address.isDefault === false && target.isDefault) {
      target.isDefault = false;
      if (user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }
    }

    await user.save();
    return user;
  }

  async deleteAddress(userId: string, addressId: string): Promise<IUserDocument> {
    const user = await this.getUserById(userId);
    const target = user.addresses.find((addr: any) => addr._id.toString() === addressId) as any;
    if (!target) {
      throw new NotFoundError('Address not found');
    }

    const wasDefault = target.isDefault;
    user.addresses = user.addresses.filter((addr: any) => addr._id.toString() !== addressId) as any;

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user;
  }

  async getAddresses(userId: string): Promise<any[]> {
    const user = await this.getUserById(userId);
    return user.addresses || [];
  }

  async setAddressDefault(userId: string, addressId: string): Promise<IUserDocument> {
    const user = await this.getUserById(userId);
    let found = false;
    user.addresses.forEach((addr: any) => {
      if (addr._id.toString() === addressId) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });
    if (!found) {
      throw new NotFoundError('Address not found');
    }
    await user.save();
    return user;
  }

  async reverseGeocode(lat: number, lon: number): Promise<any> {
    const provider = new NominatimGeocodingProvider();
    return provider.reverseGeocode(lat, lon);
  }

  async checkoutIntent(userId: string, addressId: string): Promise<void> {
    const user = await this.getUserById(userId);
    const targetAddress = user.addresses.find((addr: any) => addr._id.toString() === addressId);
    if (!targetAddress) {
      throw new NotFoundError('Selected address not found');
    }

    const cart = await CartModel.findOne({ userId: new mongoose.Types.ObjectId(userId) }).populate('items.bookId').exec();
    if (!cart || cart.items.length === 0) {
      throw new ValidationError('Your cart is empty');
    }

    const notificationsService = new NotificationsService();

    // 1. Notify Buyer
    await notificationsService.createNotification(
      userId,
      'checkout_phase3_placeholder',
      'Checkout Recorded! 📚',
      `We have saved your cart and address (${targetAddress.street}, ${(targetAddress as any).city}). We'll notify you as soon as Phase 3 checkout goes live.`,
      { addressId }
    );

    // 2. Notify Sellers
    const sellerIds = new Set<string>();
    for (const item of cart.items) {
      const listingOrBook = (item.listingId || (item as any).bookId) as any;
      if (listingOrBook && listingOrBook.sellerId) {
        sellerIds.add(listingOrBook.sellerId.toString());
      }
    }

    for (const sellerId of sellerIds) {
      await notificationsService.createNotification(
        sellerId,
        'seller_checkout_lead',
        'Buyer Interest Alert 📈',
        `A customer is interested in buying your listed books. Complete checkout transactions will launch in Phase 3.`,
        { buyerId: userId }
      );
    }

    // 3. Notify Admins
    const admins = await UserModel.find({ roles: 'admin' });
    for (const adminUser of admins) {
      await notificationsService.createNotification(
        adminUser._id.toString(),
        'platform_checkout_lead',
        'System Checkout Attempted 🛡️',
        `User ${user.name} (${user.email}) attempted checkout for ${cart.items.length} items. Ready for Phase 3 evaluation.`,
        { buyerId: userId, itemsCount: cart.items.length }
      );
    }
  }

  async updateSellerPayout(
    userId: string,
    payoutDetails: { upiId?: string; accountNumber?: string; ifscCode?: string; accountName?: string }
  ): Promise<IUserDocument> {
    const user = await this.getUserById(userId);
    if (!user.roles.includes('seller')) {
      user.roles.push('seller');
    }
    user.sellerProfile = {
      storeName: user.sellerProfile?.storeName || `${user.name}'s BookStore`,
      bio: user.sellerProfile?.bio || '',
      rating: user.sellerProfile?.rating || 5,
      totalSales: user.sellerProfile?.totalSales || 0,
      payoutDetails: {
        upiId: payoutDetails.upiId || user.sellerProfile?.payoutDetails?.upiId,
        accountNumber: payoutDetails.accountNumber || user.sellerProfile?.payoutDetails?.accountNumber,
        ifscCode: payoutDetails.ifscCode || user.sellerProfile?.payoutDetails?.ifscCode,
        accountName: payoutDetails.accountName || user.sellerProfile?.payoutDetails?.accountName,
      },
    };
    await user.save();
    return user;
  }

  async verifyUserEmail(email: string): Promise<IUserDocument> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundError('User with this email not found');
    }
    user.isEmailVerified = true;
    await user.save();
    return user;
  }

  async resetUserPassword(email: string, newPassword: string): Promise<IUserDocument> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundError('User with this email not found');
    }
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    // Invalidate refresh tokens on password change
    user.refreshTokenHash = null;
    await user.save();
    return user;
  }
}
export default UsersService;
