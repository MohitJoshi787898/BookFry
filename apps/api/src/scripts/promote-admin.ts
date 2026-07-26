import mongoose from 'mongoose';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected.');

    const res = await UserModel.updateOne(
      { email: 'admin@bookfry.com' },
      { $addToSet: { roles: 'admin' } }
    );

    console.log('Database update response:', res);
    if (res.matchedCount === 0) {
      console.log('Warning: No user with email admin@bookfry.com was found in the database. When they register/log in, they will be auto-promoted.');
    } else {
      console.log('Successfully promoted admin@bookfry.com user roles.');
    }
  } catch (err) {
    console.error('Error promoting admin user:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
