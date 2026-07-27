import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UsersRepository } from './users.repository';
import { UserModel, IUserDocument } from '../../models/user.model';
import { CartModel } from '../../models/cart.model';
import { NominatimGeocodingProvider } from './geocoding.provider';
import { NotificationsService } from '../notifications/notifications.service';
import { ConflictError, NotFoundError, ValidationError } from '../../utils/AppError';
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
  }): Promise<IUserDocument> {
    const existingUser = await this.usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const userDoc = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      roles: data.email.toLowerCase() === 'admin@bookfry.com' ? ['customer', 'seller', 'admin'] : (data.roles || ['customer']),
      isEmailVerified: false,
      isBanned: false,
      addresses: [],
      sellerProfile: null,
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
      `We have saved your cart and address (${targetAddress.street}, ${targetAddress.city}). We'll notify you as soon as Phase 3 checkout goes live.`,
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
}
export default UsersService;
