import { z } from 'zod';

export const addToCartSchema = z
  .object({
    listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Listing ID').optional(),
    bookId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Book ID').optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  })
  .refine((data) => data.listingId || data.bookId, {
    message: 'Either listingId or bookId must be provided',
    path: ['listingId'],
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
