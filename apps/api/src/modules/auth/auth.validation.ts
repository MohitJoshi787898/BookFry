import { z } from 'zod';

/**
 * Registration schema — users may only self-register as 'customer' or 'seller'.
 * The 'admin' role CANNOT be assigned via self-registration for security reasons.
 * Admin role must be assigned by an existing admin via PATCH /admin/users/:id/roles.
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  roles: z
    .array(z.enum(['customer', 'seller']))
    .optional()
    .default(['customer'])
    .refine(
      (roles) => !roles.includes('seller' as never) || roles.includes('customer' as never),
      { message: 'Seller accounts must also have the customer role' }
    ),
  // Seller profile fields — all optional at registration
  // Sellers complete their profile via PATCH /users/seller-profile after account creation
  phone: z.string().optional(),
  storeName: z.string().optional(),
  bio: z.string().optional(),
  upiId: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({});

export const sendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyEmailOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyResetOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const resetPasswordOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
