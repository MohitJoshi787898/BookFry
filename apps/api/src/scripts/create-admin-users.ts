import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';

async function createAdminUsers() {
  try {
    console.log('🔄 Connecting to MongoDB database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminAccounts = [
      {
        name: 'BookFry System Admin',
        email: 'admin@bookfry.com',
        password: 'AdminBookFry123!',
        roles: ['customer', 'seller', 'admin'],
        storeName: 'BookFry Official Admin Store',
      },
      {
        name: 'Senior Moderator Admin',
        email: 'moderator@bookfry.com',
        password: 'ModBookFry123!',
        roles: ['customer', 'seller', 'admin'],
        storeName: 'BookFry Moderator Portal',
      },
    ];

    const salt = await bcrypt.genSalt(12);

    for (const acc of adminAccounts) {
      // Clean existing user with same email
      await UserModel.deleteMany({ email: acc.email });

      const passwordHash = await bcrypt.hash(acc.password, salt);

      const user = await UserModel.create({
        name: acc.name,
        email: acc.email,
        passwordHash,
        roles: acc.roles,
        isEmailVerified: true,
        addresses: [
          {
            street: 'BookFry HQ, Tech Park',
            city: 'New Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India',
            isDefault: true,
          },
        ],
        sellerProfile: {
          storeName: acc.storeName,
          bio: 'Official BookFry System Administrator.',
          rating: 5.0,
          totalSales: 150,
          payoutDetails: {
            upiId: 'admin@okaxis',
            accountName: 'BookFry Admin Operations',
            accountNumber: '919876543210',
            ifscCode: 'UTIB0000123',
          },
        },
        sellerOnboardingStatus: 'complete',
        sellerVerificationStatus: 'approved',
      });

      console.log('🎉 Admin Account Created:');
      console.log(`- ID      : ${user._id.toString()}`);
      console.log(`- Name    : ${user.name}`);
      console.log(`- Email   : ${user.email}`);
      console.log(`- Password: ${acc.password}`);
      console.log(`- Roles   : ${user.roles.join(', ')}`);
      console.log('-------------------------------------------');
    }
  } catch (error) {
    console.error('❌ Error creating admin users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🚪 MongoDB connection closed');
  }
}

createAdminUsers();
