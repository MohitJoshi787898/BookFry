import { z } from 'zod';

export const addToCartSchema = z.object({
  bookId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Book ID'),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const mergeCartSchema = z.object({
  items: z.array(
    z.object({
      bookId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Book ID'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ),
});
