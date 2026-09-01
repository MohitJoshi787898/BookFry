import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load env variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  REDIS_URL: z.string().optional().default(''),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  COOKIE_DOMAIN: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  // SMTP & Email Configuration
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().default('notifications@bookfry.in'),
  SMTP_PASS: z.string().default('dummy-google-app-password'),
  SMTP_FROM: z.string().default('"BookFry" <notifications@bookfry.in>'),
  // Firebase Cloud Messaging & Push Notification Config
  FIREBASE_PROJECT_ID: z.string().default('bookfry-app-dummy'),
  FIREBASE_CLIENT_EMAIL: z.string().default('firebase-adminsdk@bookfry-app-dummy.iam.gserviceaccount.com'),
  FIREBASE_PRIVATE_KEY: z.string().default('dummy-firebase-private-key'),
  VAPID_PUBLIC_KEY: z.string().default('dummy-vapid-public-key'),
  VAPID_PRIVATE_KEY: z.string().default('dummy-vapid-private-key'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
