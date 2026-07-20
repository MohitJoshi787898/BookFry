import bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { IUserDocument } from '../../models/user.model';
import { ConflictError, NotFoundError } from '../../utils/AppError';
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
      roles: data.roles || ['customer'],
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

  mapToDTO(user: IUserDocument): Omit<User, 'createdAt' | 'updatedAt' | 'addresses'> {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      roles: user.roles,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      isBanned: user.isBanned,
      sellerProfile: user.sellerProfile
        ? {
            storeName: user.sellerProfile.storeName,
            bio: user.sellerProfile.bio,
            rating: user.sellerProfile.rating,
            totalSales: user.sellerProfile.totalSales,
            payoutDetails: user.sellerProfile.payoutDetails,
          }
        : null,
    };
  }
}
export default UsersService;
