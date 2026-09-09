/**
 * Migration: Backfill seller onboarding and verification status fields
 *
 * Run this script once after deploying the updated User model to MongoDB.
 *
 * Logic:
 *   For all users with roles.includes('seller'):
 *     - If sellerProfile !== null → onboardingStatus: 'complete'
 *     - If sellerProfile === null → onboardingStatus: 'incomplete'
 *     - sellerVerificationStatus: 'not_submitted' (no existing verification workflow existed)
 *
 *   For all users without seller role:
 *     - These fields remain undefined (not set)
 *
 * Usage:
 *   npx ts-node src/scripts/backfill-seller-onboarding.ts
 */

import mongoose from 'mongoose';
import { UserModel } from '../models/user.model';
import { env } from '../config/env';

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('[Migration] Connected to MongoDB');

  // 1. Sellers with complete profiles
  const completeResult = await UserModel.updateMany(
    {
      roles: 'seller',
      sellerProfile: { $ne: null },
      sellerOnboardingStatus: { $exists: false },
    },
    {
      $set: {
        sellerOnboardingStatus: 'complete',
        sellerVerificationStatus: 'not_submitted',
      },
    }
  );

  console.log(`[Migration] Marked ${completeResult.modifiedCount} sellers as onboarding complete`);

  // 2. Sellers with incomplete profiles
  const incompleteResult = await UserModel.updateMany(
    {
      roles: 'seller',
      sellerProfile: null,
      sellerOnboardingStatus: { $exists: false },
    },
    {
      $set: {
        sellerOnboardingStatus: 'incomplete',
        sellerVerificationStatus: 'not_submitted',
      },
    }
  );

  console.log(`[Migration] Marked ${incompleteResult.modifiedCount} sellers as onboarding incomplete`);

  // 3. Verify — report any sellers still missing the field
  const remaining = await UserModel.countDocuments({
    roles: 'seller',
    sellerOnboardingStatus: { $exists: false },
  });

  if (remaining > 0) {
    console.warn(`[Migration] WARNING: ${remaining} sellers still missing sellerOnboardingStatus`);
  } else {
    console.log('[Migration] All seller accounts successfully backfilled ✓');
  }

  await mongoose.disconnect();
  console.log('[Migration] Done');
}

run().catch((err) => {
  console.error('[Migration] FAILED:', err);
  process.exit(1);
});
