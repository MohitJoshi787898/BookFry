import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';

async function createDemoUser() {
  try {
    console.log('🔄 Connecting to MongoDB database...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const demoEmail = 'demouser@bookfry.com';
    const demoPassword = 'DemoUser123!';

    // Remove existing demo user if present to ensure clean state
    await UserModel.deleteMany({ email: demoEmail });

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(demoPassword, salt);

    const user = await UserModel.create({
      name: 'Mohit Joshi (Demo User)',
      email: demoEmail,
      passwordHash,
      roles: ['customer', 'seller'],
      isEmailVerified: true,
      addresses: [
        {
          street: '123 Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
          isDefault: true,
        },
      ],
      sellerProfile: {
        storeName: "Mohit's Book Fry Store",
        bio: 'Verified student seller on BookFry. Selling engineering, technology, and literature textbooks.',
        rating: 4.9,
        totalSales: 28,
      },
    });

    console.log('🎉 Demo User successfully created in MongoDB!');
    console.log('-------------------------------------------');
    console.log(`User ID : ${user._id.toString()}`);
    console.log(`Name    : ${user.name}`);
    console.log(`Email   : ${user.email}`);
    console.log(`Password: ${demoPassword}`);
    console.log(`Roles   : ${user.roles.join(', ')}`);
    console.log('-------------------------------------------');
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🚪 MongoDB connection closed');
  }
}

createDemoUser();
