import { z } from 'zod';

export const addToCartSchema = z.object({
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Listing ID'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Listing ID'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ),
});
