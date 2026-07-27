import { z } from 'zod';

export const checkoutSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
    'return_requested',
    'return_approved',
    'return_rejected',
  ]),
  note: z.string().optional(),
});

export const requestReturnSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason of at least 10 characters'),
});

export const resolveReturnSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNote: z.string().optional(),
});
